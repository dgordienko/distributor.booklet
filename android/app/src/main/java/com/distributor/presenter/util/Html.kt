package com.distributor.presenter.util

import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import org.jsoup.Jsoup
import org.jsoup.nodes.Element
import org.jsoup.nodes.Node
import org.jsoup.nodes.TextNode

// Один абзац или пункт списка. Рендерится как отдельный Text(), поэтому
// textAlign применяется через обычный параметр Text, а не через
// AnnotatedString.ParagraphStyle (у которого строгие требования к
// выравниванию диапазона на границы параграфов).
data class HtmlBlock(val text: AnnotatedString, val align: TextAlign)

private data class InlineMark(
    val bold: Boolean = false,
    val italic: Boolean = false,
    val underline: Boolean = false,
    val strike: Boolean = false,
)

private fun parseAlign(styleAttr: String): TextAlign = when {
    styleAttr.contains("center") -> TextAlign.Center
    styleAttr.contains("right") -> TextAlign.Right
    styleAttr.contains("justify") -> TextAlign.Justify
    else -> TextAlign.Left
}

private fun appendInline(builder: AnnotatedString.Builder, node: Node, mark: InlineMark) {
    when (node) {
        is TextNode -> {
            val text = node.text()
            if (text.isEmpty()) return
            val start = builder.length
            builder.append(text)
            val end = builder.length
            if (mark.bold || mark.italic || mark.underline || mark.strike) {
                val decoration = when {
                    mark.underline && mark.strike ->
                        TextDecoration.combine(listOf(TextDecoration.Underline, TextDecoration.LineThrough))
                    mark.underline -> TextDecoration.Underline
                    mark.strike -> TextDecoration.LineThrough
                    else -> null
                }
                builder.addStyle(
                    SpanStyle(
                        fontWeight = if (mark.bold) FontWeight.Bold else null,
                        fontStyle = if (mark.italic) FontStyle.Italic else null,
                        textDecoration = decoration,
                    ),
                    start,
                    end,
                )
            }
        }
        is Element -> {
            if (node.tagName().equals("br", ignoreCase = true)) {
                builder.append("\n")
                return
            }
            val childMark = when (node.tagName().lowercase()) {
                "strong", "b" -> mark.copy(bold = true)
                "em", "i" -> mark.copy(italic = true)
                "u" -> mark.copy(underline = true)
                "s", "strike", "del" -> mark.copy(strike = true)
                else -> mark
            }
            node.childNodes().forEach { appendInline(builder, it, childMark) }
        }
    }
}

// `children` are the inline nodes to render inside this block (the content
// of a <p>/<li>, or a single bare text node for the top-level fallback case).
private fun buildBlockText(children: List<Node>, prefix: String): AnnotatedString {
    val builder = AnnotatedString.Builder()
    if (prefix.isNotEmpty()) builder.append(prefix)
    children.forEach { appendInline(builder, it, InlineMark()) }
    return builder.toAnnotatedString()
}

// Описания товаров/категорий редактируются в админке через ограниченный
// rich-text (Tiptap: жирный/курсив/подчёркнутый/зачёркнутый, списки,
// выравнивание абзаца — без заголовков/цитат/кода/ссылок) и приходят с
// backend как HTML. Разбираем через Jsoup, а не через Android HtmlCompat,
// потому что встроенный HTML-парсер Android не умеет надёжно нумеровать
// <ol> на всех версиях API.
fun String.htmlToBlocks(): List<HtmlBlock> {
    val body = Jsoup.parseBodyFragment(this).body()
    val blocks = mutableListOf<HtmlBlock>()

    fun listItemContent(li: Element): Element = li.getElementsByTag("p").firstOrNull() ?: li

    body.childNodes().forEach { node ->
        when {
            node is Element && node.tagName().equals("p", ignoreCase = true) -> {
                blocks += HtmlBlock(
                    buildBlockText(node.childNodes(), ""),
                    parseAlign(node.attr("style")),
                )
            }
            node is Element && node.tagName().equals("ul", ignoreCase = true) -> {
                val items: List<Element> = node.select("> li")
                items.forEach { li ->
                    val content = listItemContent(li)
                    blocks += HtmlBlock(
                        buildBlockText(content.childNodes(), "•  "),
                        parseAlign(content.attr("style")),
                    )
                }
            }
            node is Element && node.tagName().equals("ol", ignoreCase = true) -> {
                val items: List<Element> = node.select("> li")
                items.forEachIndexed { index, li ->
                    val content = listItemContent(li)
                    blocks += HtmlBlock(
                        buildBlockText(content.childNodes(), "${index + 1}.  "),
                        parseAlign(content.attr("style")),
                    )
                }
            }
            node is TextNode && node.text().isNotBlank() -> {
                blocks += HtmlBlock(buildBlockText(listOf(node), ""), TextAlign.Left)
            }
        }
    }

    return blocks
}
