#!/usr/bin/env python3
"""Parse structured spec sheet PDF into JSON using text extraction."""
import sys
import json
import re
import fitz

CATEGORY_MAP = {
    "основні характеристики": ("Основні характеристики", "Основные характеристики"),
    "основные характеристики": ("Основні характеристики", "Основные характеристики"),
    "габарити": ("Габарити", "Габариты"),
    "габариты": ("Габарити", "Габариты"),
    "двигун": ("Двигун", "Двигатель"),
    "двигатель": ("Двигун", "Двигатель"),
    "батарея": ("Батарея", "Батарея"),
    "безпека": ("Безпека", "Безопасность"),
    "безопасность": ("Безпека", "Безопасность"),
    "підвіска та колеса": ("Підвіска та колеса", "Подвеска и колёса"),
    "подвеска и колеса": ("Підвіска та колеса", "Подвеска и колёса"),
    "подвеска и колёса": ("Підвіска та колеса", "Подвеска и колёса"),
    "мультимедіа": ("Мультимедіа", "Мультимедиа"),
    "мультимедиа": ("Мультимедіа", "Мультимедиа"),
    "комфорт": ("Комфорт", "Комфорт"),
    "ключові відмінності комплектацій": ("Ключові відмінності", "Ключевые отличия"),
    "ключевые отличия комплектаций": ("Ключові відмінності", "Ключевые отличия"),
}

# Known parameter name patterns to help distinguish params from values
PARAM_PATTERNS = [
    r"ємність", r"емкость", r"запас", r"розгін", r"разгон", r"кількість", r"количество",
    r"потужність", r"мощность", r"максимальна", r"максимальная", r"привід", r"привод",
    r"швидкість", r"скорость", r"об'єм", r"объем", r"тип", r"довжина", r"длина",
    r"ширина", r"висота", r"высота", r"маса", r"масса", r"крутний", r"крутящий",
    r"охолодження", r"охлаждение", r"переднагрівання", r"предварительный",
    r"подушок", r"подушек", r"система", r"abs", r"esp", r"isofix", r"auto hold",
    r"матеріал", r"материал", r"передня підвіска", r"передняя подвеска",
    r"задня підвіска", r"задняя подвеска", r"передні гальм", r"передние тормоз",
    r"задні гальм", r"задние тормоз", r"розмір", r"размер", r"стоянков", r"запасне",
    r"запасное", r"підтримка", r"панель", r"центральний", r"центральный",
    r"навігац", r"навигац", r"bluetooth", r"гучний", r"громк", r"бортовий", r"бортовой",
    r"джерело", r"источник", r"мульти", r"парктронік", r"парктроник", r"денні", r"дневные",
    r"електропривід", r"электропривод", r"запуск", r"оздоблення", r"отделка",
    r"проекц", r"багажник", r"динамік", r"динамик", r"підігрів", r"подогрев",
    r"підсвіч", r"подсветк", r"клімат", r"климат", r"сенсор", r"датчик",
    r"круїз", r"круиз", r"камера", r"електродзеркал", r"электрозеркал",
    r"люк", r"автосвітло", r"автомобільн", r"бездротов", r"беспроводн",
    r"пам'ять", r"память", r"безключов", r"бесключев", r"масаж", r"массаж",
    r"вентиляц", r"англійськ", r"английск", r"carplay", r"android",
    r"модель двигуна", r"модель двигателя", r"впуск", r"циліндр", r"цилиндр",
    r"dohc", r"паливо", r"топлив", r"марка", r"гібрид", r"гибрид",
    r"активн", r"розпізнав", r"распознав", r"утриман", r"удержан",
    r"моніторинг", r"мониторинг",
    r"пакет", r"нульов", r"нулев", r"повний", r"полный", r"полн",
    r"мінімальн", r"минимальн", r"загальн", r"общ",
    r"суммарн", r"сумарн",
]

VALUE_PATTERNS = [
    r"^\+$", r"^-$", r"^—$", r"^✓$", r"^\d", r"^задній$", r"^задний$",
    r"^передній", r"^передний", r"рідинне", r"жидкостн", r"літієв", r"литиев",
    r"фосфат", r"кросовер", r"кроссовер", r"дисков", r"барабан",
    r"електронн", r"электронн", r"цифров", r"сенсорний", r"сенсорный",
    r"lcd", r"led", r"матричний", r"матричный", r"шкір", r"кож", r"екошкір",
    r"водій", r"водитель", r"пасажир", r"пассажир", r"панорам",
    r"легкосплавн", r"незалежн", r"независим", r"макферсон",
    r"багаторичаж", r"многорычаж", r"вентил", r"синхрон",
    r"адаптивн", r"атмосферн", r"розподіл", r"распределит",
    r"^\d+[,./]", r"^r\d", r"^\d+\s*(зон|сек|к\.с)", r"^так",
    r"многоцвет", r"багатоколір",
]


def is_likely_value(text):
    """Check if text looks like a spec value rather than a param name."""
    low = text.lower().strip()
    if not low:
        return False
    for p in VALUE_PATTERNS:
        if re.search(p, low):
            return True
    return False


def is_likely_param(text):
    """Check if text looks like a parameter name."""
    low = text.lower().strip()
    if not low:
        return False
    for p in PARAM_PATTERNS:
        if re.search(p, low):
            return True
    return False


def find_category(name, strict=True):
    low = name.lower().strip()
    for key, (uk, ru) in CATEGORY_MAP.items():
        if low == key:
            return uk, ru
    # In strict mode, only exact match. In non-strict, allow prefix match too
    if not strict:
        for key, (uk, ru) in CATEGORY_MAP.items():
            if low.startswith(key) and len(low) - len(key) < 5:
                return uk, ru
    return None, None


def normalize_val(v):
    return v.replace("✓", "+").strip() if v else "—"


def parse_pdf(path):
    doc = fitz.open(path)

    # Extract all text
    full_text = ""
    for page in doc:
        full_text += page.get_text() + "\n"

    lines = [l.strip() for l in full_text.split("\n")]

    # Detect brand/model from first lines
    brand, model = "", ""
    for line in lines[:15]:
        if not line:
            continue
        if any(x in line.lower() for x in ["тел", "electro", "+380"]):
            continue
        if any(x in line.lower() for x in ["характеристик", "комплектац", "параметр"]):
            continue
        # Skip lines that look like trim names or param names
        if re.match(r"^\d+\s*(km|КМ|Pro|Max|Sport|Elite|Luxury|Premium|Flagship|FWD|AWD|RWD)", line, re.IGNORECASE):
            continue
        if is_likely_param(line) or is_likely_value(line):
            continue
        # Skip pure numbers or very short lines
        if re.match(r"^[\d,.—+\-\s]+$", line):
            continue
        # Must look like a brand name: starts with a letter, not a known spec term
        if not re.match(r"^[A-ZА-ЯІЇЄҐ]", line):
            continue
        if not brand:
            parts = line.split(None, 1)
            brand = parts[0]
            model = parts[1] if len(parts) > 1 else ""
            break

    # If brand not found, try to extract from filename
    if not brand and len(sys.argv) > 1:
        import os
        fname = os.path.splitext(os.path.basename(sys.argv[1]))[0]
        # Remove common suffixes
        fname = re.sub(r"_with_.*|_specs|_характеристики", "", fname, flags=re.IGNORECASE)
        parts = fname.replace("_", " ").replace("-", " ").split(None, 1)
        brand = parts[0] if parts else ""
        model = parts[1] if len(parts) > 1 else ""

    # Find trims (after "Комплектація" or "Параметр" line)
    trims = []
    trim_count = 0
    data_start = 0

    for i, line in enumerate(lines):
        low = line.lower().strip()
        if "комплектац" in low or low == "параметр":
            # Collect trim names
            j = i + 1
            while j < len(lines) and len(trims) < 10:
                t = lines[j].strip()
                if not t:
                    j += 1
                    continue
                # Stop if this looks like a param name
                if is_likely_param(t):
                    break
                trims.append(t)
                j += 1
            trim_count = len(trims)
            data_start = j
            break

    if trim_count == 0:
        return {"brand": brand, "model": model, "trims": [], "categories": []}

    # Now parse spec rows: each "row" = param_name (possibly multi-line) + trim_count values (possibly multi-line each)
    categories = []
    current_cat = None
    i = data_start

    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue

        # Check for category header (only if it's a standalone line, not followed by values)
        cat_uk, cat_ru = find_category(line)
        # Verify it's really a category header: next non-empty line should be "Параметр" or a param name, not a value
        if cat_uk:
            next_non_empty = ""
            for ni in range(i+1, min(i+5, len(lines))):
                if lines[ni].strip():
                    next_non_empty = lines[ni].strip()
                    break
            if is_likely_value(next_non_empty):
                cat_uk = None  # It's actually a value like "Потрійна літієва батарея"
        if cat_uk:
            current_cat = {"name_uk": cat_uk, "name_ru": cat_ru, "rows": []}
            categories.append(current_cat)
            i += 1
            # Skip "Параметр" header line and trim names that follow category headers
            if i < len(lines) and "параметр" in lines[i].lower().strip():
                i += 1
                # Skip trim names
                skipped = 0
                while i < len(lines) and skipped < trim_count:
                    if lines[i].strip():
                        skipped += 1
                    i += 1
            continue

        # Ensure default category
        if not current_cat:
            current_cat = {"name_uk": "Основні характеристики", "name_ru": "Основные характеристики", "rows": []}
            categories.append(current_cat)

        # Collect parameter name (may span multiple lines)
        param_parts = [line]
        j = i + 1

        # Look ahead: if next line(s) are NOT values, they're part of the param name
        while j < len(lines):
            next_line = lines[j].strip()
            if not next_line:
                j += 1
                continue
            # If it looks like a value, stop collecting param name
            if is_likely_value(next_line):
                break
            # If it looks like another param, stop
            if is_likely_param(next_line) and len(param_parts) > 1:
                break
            # If it's a category header, stop
            if find_category(next_line)[0]:
                break
            param_parts.append(next_line)
            j += 1

        param_name = " ".join(param_parts)

        # Now collect trim_count values (each may be multi-line)
        values = []
        k = j
        while k < len(lines) and len(values) < trim_count:
            val_line = lines[k].strip()
            if not val_line:
                k += 1
                continue

            # Check if this might be a new category header
            if find_category(val_line)[0]:
                break

            # Start collecting a value (may be multi-line for complex values)
            val_parts = [val_line]
            k += 1

            # Check if the NEXT lines are continuations of this value
            # A value continuation: not a new param, not a new category, and we haven't reached trim_count values yet
            while k < len(lines) and len(values) < trim_count - 1:
                next_l = lines[k].strip()
                if not next_l:
                    k += 1
                    continue
                # If the next-next trim_count-1 lines could form values, this isn't a continuation
                # Simple heuristic: if after collecting remaining values from here works out, break
                if is_likely_value(next_l) or is_likely_param(next_l) or find_category(next_l)[0]:
                    break
                # Check if remaining lines can fill remaining values
                remaining_needed = trim_count - len(values) - 1
                future_lines = [l.strip() for l in lines[k:k+remaining_needed*3] if l.strip()]
                if len(future_lines) >= remaining_needed:
                    # Likely this is a continuation
                    val_parts.append(next_l)
                    k += 1
                else:
                    break

            values.append(normalize_val(" ".join(val_parts)))

        if len(values) == trim_count:
            current_cat["rows"].append({
                "param_uk": param_name,
                "param_ru": param_name,
                "values": values,
            })
            i = k
        else:
            # Couldn't parse this row properly, skip the line
            i += 1

    return {
        "brand": brand,
        "model": model,
        "trims": trims,
        "categories": categories,
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: parse-pdf.py <path>", file=sys.stderr)
        sys.exit(1)

    result = parse_pdf(sys.argv[1])
    json.dump(result, sys.stdout, ensure_ascii=False, indent=2)
