# 캐릭터 시트에서 '등신대 전신' 한 명을 잘라 assets/heroines/<id>/full.webp 로 저장한다(화면용: 슬롯·캐릭터 만들기·상태창·만남).
# 시트마다 배치가 달라 좌표를 눈으로 정해 둔다(시트 원본 1536×1024 기준). 노출이 많은 기본 의상 대신 단정한 의상을 고른 캐릭터도 있다.
# 사용: python3 tools/crop-fullbody.py   (art-src/jpg/sheet_<id>.jpg 를 읽는다)
from PIL import Image
BOX = {
    "hero_m": (530, 50, 690, 475),       # 생존자 기본복
    "hero_f": (1283, 150, 1405, 520),    # 연구소 복장
    "harin": (810, 150, 925, 505),       # 생존자 기본복(그대로)
    "seoyun": (735, 88, 870, 482), "dokgo": (783, 147, 910, 510), "mira": (1085, 75, 1197, 475),
    "bongsu": (695, 30, 925, 370), "ara": (698, 45, 840, 462), "taeho": (790, 75, 940, 495),
    "seolhwa": (715, 45, 925, 432), "eunbi": (715, 45, 845, 480), "ahyeon": (1203, 45, 1338, 452),
    "soyul": (803, 150, 930, 510), "chaeryeong": (633, 48, 778, 468), "dain": (787, 32, 935, 392),
    "eunsol": (598, 418, 730, 616), "yerin": (633, 40, 778, 472), "mina": (1015, 45, 1138, 465),
}
for k, b in BOX.items():
    im = Image.open(f"art-src/jpg/sheet_{k}.jpg").convert("RGB").crop(b)
    s = 640 / im.height
    im = im.resize((round(im.width * s), 640), Image.LANCZOS)
    im.save(f"assets/heroines/{k}/full.webp", quality=86)
print(len(BOX))

# 주인공·유하린: 시트의 '다양한 의상' 6벌을 모두 잘라 둔다 → 입은 옷에 따라 바뀐다(outfit_<이름>.webp)
OUTFIT_NAMES = ["survivor", "combat", "medic", "explorer", "lab", "special"]
OUTFITS = {
    "hero_m": ([533, 687, 867, 1053, 1207, 1353, 1507], 50, 475),
    "hero_f": ([810, 933, 1047, 1160, 1280, 1400, 1527], 150, 508),
    "harin": ([810, 925, 1045, 1165, 1290, 1405, 1525], 150, 505),
}
for k, (xs, y0, y1) in OUTFITS.items():
    src = Image.open(f"art-src/jpg/sheet_{k}.jpg").convert("RGB")
    for i, nm in enumerate(OUTFIT_NAMES):
        im = src.crop((xs[i], y0, xs[i + 1], y1)); s = 640 / im.height
        im.resize((round(im.width * s), 640), Image.LANCZOS).save(f"assets/heroines/{k}/outfit_{nm}.webp", quality=86)
# 유하린 '기본 의상'(최소한의 옷) 정면 — 옷을 안 입었을 때
src = Image.open("art-src/jpg/sheet_harin.jpg").convert("RGB")
im = src.crop((452, 182, 578, 530)); s = 640 / im.height
im.resize((round(im.width * s), 640), Image.LANCZOS).save("assets/heroines/harin/outfit_base.webp", quality=86)
