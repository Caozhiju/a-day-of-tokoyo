#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
clean_tokyo.txt → tokyo_chunks.json

按 ~500 字切片，输出 JSON 数组，每条含 id 和 content。
"""

import json
import os

INPUT = "clean_tokyo.txt"
OUTPUT = "tokyo_chunks.json"
CHUNK_SIZE = 500  # 目标字符数


def chunk_text(text: str, size: int) -> list[dict[str, str]]:
    """将文本按指定字符数切片，尽量在段落边界断开"""
    chunks = []
    start = 0
    total = len(text)
    idx = 1

    while start < total:
        end = start + size

        if end >= total:
            end = total
        else:
            # 尝试在前一个段落换行处断开
            cut = text.rfind("\n", start, end)
            if cut > start + size // 2:
                end = cut
            else:
                # 尝试在前一个句号处断开
                cut = text.rfind("。", start, end)
                if cut > start + size // 2:
                    end = cut + 1

        content = text[start:end].strip()
        if content:
            chunks.append({"id": f"chunk_{idx:03d}", "content": content})
            idx += 1

        start = end

    return chunks


def main():
    if not os.path.isfile(INPUT):
        print(f"❌ 未找到：{INPUT}")
        return

    with open(INPUT, "r", encoding="utf-8") as f:
        raw = f.read()

    print(f"📖 读取：{INPUT}")
    print(f"   大小：{len(raw)} 字符")

    chunks = chunk_text(raw, CHUNK_SIZE)

    print(f"✂️  切片：{len(chunks)} 段（目标 ~{CHUNK_SIZE} 字/段）")

    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(chunks, f, ensure_ascii=False, indent=2)

    print(f"✅ 输出：{OUTPUT}")
    print(f"   文件大小：{os.path.getsize(OUTPUT)} 字节")


if __name__ == "__main__":
    main()
