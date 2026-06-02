#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
东京梦华录 · 文本清洗脚本

功能：
1. 删除空行
2. 删除连续空格
3. 删除页码（如 "12"、"— 13 —"、"[14]" 等）
4. 删除无意义符号（多余标点、特殊符号等）

输入：东京梦华录.txt
输出：clean_tokyo.txt
编码：UTF-8
"""

import re
import os

INPUT_FILE = "东京梦华录.txt"
OUTPUT_FILE = "clean_tokyo.txt"


def clean_text(text: str) -> str:
    lines = text.splitlines()
    cleaned = []

    for line in lines:
        # 1. 去除首尾空白
        line = line.strip()

        # 2. 删除空行
        if not line:
            continue

        # 3. 删除页码行（纯数字、带装饰的页码）
        #    匹配如： "12"、"— 12 —"、"【12】"、"[12]"、"(12)"、"第12页"
        if re.match(r'^[—\-—\-−–\s]*\d+[—\-—\-−–\s]*$', line):
            continue
        if re.match(r'^[【\[\(（]\d+[】\]\)）]', line):
            continue
        if re.match(r'^第\s*\d+\s*页$', line):
            continue

        # 4. 删除无意义符号（行首或行尾的装饰性符号）
        #    删除行首的 "·"、"◆"、"■"、"●"、"※"、"■" 等装饰符
        line = re.sub(r'^[·◆■●※★☆◎○□△▲▼▽◇◆↑↓→←↔]+', '', line).strip()
        line = re.sub(r'[·◆■●※★☆◎○□△▲▼▽◇◆↑↓→←↔]+$', '', line).strip()

        # 5. 删除连续空格（将 2 个及以上空格压缩为 1 个）
        line = re.sub(r' {2,}', ' ', line)

        # 6. 删除连续空行标记（如 "……" 3个以上保留为 "……"）
        line = re.sub(r'。{3,}', '。', line)

        # 若删除后为空则跳过
        if not line:
            continue

        cleaned.append(line)

    return '\n'.join(cleaned)


def main():
    # 尝试多个路径寻找源文件
    search_paths = [
        INPUT_FILE,
        os.path.join(os.path.dirname(__file__), INPUT_FILE),
        os.path.join(os.path.dirname(os.path.dirname(__file__)), INPUT_FILE),
    ]

    source_path = None
    for p in search_paths:
        if os.path.isfile(p):
            source_path = p
            break

    if not source_path:
        print(f"❌ 未找到源文件：「{INPUT_FILE}」")
        print("  请将文件放置在以下任一位置：")
        for p in search_paths:
            print(f"    • {os.path.abspath(p)}")
        return

    print(f"📖 读取：{source_path}")

    # 读取
    with open(source_path, 'r', encoding='utf-8') as f:
        raw = f.read()

    print(f"   原始大小：{len(raw)} 字符")
    print(f"   原始行数：{raw.count(chr(10)) + 1} 行")

    # 清洗
    result = clean_text(raw)

    print(f"   清洗后大小：{len(result)} 字符")
    print(f"   清洗后行数：{result.count(chr(10)) + 1} 行")

    # 输出
    output_path = os.path.join(os.path.dirname(source_path), OUTPUT_FILE) \
        if os.path.dirname(source_path) else OUTPUT_FILE

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(result)

    print(f"✅ 输出：{os.path.abspath(output_path)}")


if __name__ == '__main__':
    main()
