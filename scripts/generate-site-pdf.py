#!/usr/bin/env python3
"""
generate-site-pdf.py — Convert all site content into a PDF document.

Uses ReportLab to create a comprehensive document with:
  - Cover page
  - Trip overview
  - 6-day itinerary with all stop details
  - Attraction catalog (27 entries)
  - Roadside attractions (17 entries)
  - Pro tips
  - Sources & citations
"""

import json
import sys
import os
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
    KeepTogether, ListFlowable, ListItem, HRFlowable
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY

# ── Register fonts ────────────────────────────────────────────────────
FONT_DIR = '/usr/share/fonts'

# Try to register Noto Serif SC for body text
try:
    pdfmetrics.registerFont(TTFont('NotoSerifSC', f'{FONT_DIR}/truetype/noto-serif-sc/NotoSerifSC-Regular.ttf'))
    pdfmetrics.registerFont(TTFont('NotoSerifSC-Bold', f'{FONT_DIR}/truetype/noto-serif-sc/NotoSerifSC-Bold.ttf'))
    registerFontFamily('NotoSerifSC', normal='NotoSerifSC', bold='NotoSerifSC-Bold')
    BODY_FONT = 'NotoSerifSC'
    BOLD_FONT = 'NotoSerifSC-Bold'
except:
    try:
        pdfmetrics.registerFont(TTFont('Tinos', f'{FONT_DIR}/truetype/english/Tinos-Regular.ttf'))
        pdfmetrics.registerFont(TTFont('Tinos-Bold', f'{FONT_DIR}/truetype/english/Tinos-Bold.ttf'))
        registerFontFamily('Tinos', normal='Tinos', bold='Tinos-Bold')
        BODY_FONT = 'Tinos'
        BOLD_FONT = 'Tinos-Bold'
    except:
        BODY_FONT = 'Times-Roman'
        BOLD_FONT = 'Times-Bold'

# Try to register a sans-serif for headings
try:
    pdfmetrics.registerFont(TTFont('Carlito', f'{FONT_DIR}/truetype/english/Carlito-Regular.ttf'))
    pdfmetrics.registerFont(TTFont('Carlito-Bold', f'{FONT_DIR}/truetype/english/Carlito-Bold.ttf'))
    registerFontFamily('Carlito', normal='Carlito', bold='Carlito-Bold')
    HEAD_FONT = 'Carlito-Bold'
    SANS_FONT = 'Carlito'
except:
    HEAD_FONT = 'Helvetica-Bold'
    SANS_FONT = 'Helvetica'

# ── Color palette ─────────────────────────────────────────────────────
PRIMARY = colors.HexColor('#2d4a3a')
ACCENT = colors.HexColor('#b8541f')
BRASS = colors.HexColor('#b8860b')
BARK = colors.HexColor('#3d2817')
CREAM = colors.HexColor('#faf3e3')
PARCHMENT = colors.HexColor('#ede0c4')
WAX = colors.HexColor('#7a2418')
LIGHT_BG = colors.HexColor('#f5ebd6')
MUTED = colors.HexColor('#6b4423')

# ── Load content ──────────────────────────────────────────────────────
with open('/tmp/site-content.json', 'r') as f:
    data = json.load(f)

# ── Styles ────────────────────────────────────────────────────────────
styles = getSampleStyleSheet()

cover_title = ParagraphStyle('CoverTitle', parent=styles['Title'],
    fontName=HEAD_FONT, fontSize=36, textColor=PRIMARY, alignment=TA_CENTER,
    spaceAfter=12, leading=42)

cover_subtitle = ParagraphStyle('CoverSubtitle', parent=styles['Normal'],
    fontName=BODY_FONT, fontSize=16, textColor=ACCENT, alignment=TA_CENTER,
    spaceAfter=6, leading=20)

cover_meta = ParagraphStyle('CoverMeta', parent=styles['Normal'],
    fontName=SANS_FONT, fontSize=11, textColor=MUTED, alignment=TA_CENTER,
    spaceAfter=4, leading=14)

h1 = ParagraphStyle('H1', parent=styles['Heading1'],
    fontName=HEAD_FONT, fontSize=24, textColor=PRIMARY, spaceBefore=20, spaceAfter=12, leading=28)

h2 = ParagraphStyle('H2', parent=styles['Heading2'],
    fontName=HEAD_FONT, fontSize=18, textColor=ACCENT, spaceBefore=16, spaceAfter=8, leading=22)

h3 = ParagraphStyle('H3', parent=styles['Heading3'],
    fontName=HEAD_FONT, fontSize=14, textColor=PRIMARY, spaceBefore=12, spaceAfter=6, leading=18)

body = ParagraphStyle('Body', parent=styles['Normal'],
    fontName=BODY_FONT, fontSize=10.5, textColor=BARK, alignment=TA_JUSTIFY,
    spaceAfter=6, leading=15, firstLineIndent=0)

body_indent = ParagraphStyle('BodyIndent', parent=body,
    leftIndent=18, spaceAfter=4)

bullet = ParagraphStyle('Bullet', parent=body,
    leftIndent=24, bulletIndent=12, spaceAfter=3)

tip = ParagraphStyle('Tip', parent=body,
    leftIndent=18, fontSize=10, textColor=MUTED, spaceAfter=4, leading=14)

caption = ParagraphStyle('Caption', parent=styles['Normal'],
    fontName=SANS_FONT, fontSize=9, textColor=MUTED, alignment=TA_CENTER,
    spaceAfter=8, leading=12)

source_style = ParagraphStyle('Source', parent=styles['Normal'],
    fontName=SANS_FONT, fontSize=8.5, textColor=MUTED, spaceAfter=3, leading=11)

# ── Build document ────────────────────────────────────────────────────
OUTPUT = '/home/z/my-project/download/J-Dee-Wilderness-Romance.pdf'
os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)

doc = SimpleDocTemplate(OUTPUT, pagesize=letter,
    topMargin=0.75*inch, bottomMargin=0.75*inch,
    leftMargin=0.85*inch, rightMargin=0.85*inch,
    title="J & Dee — The Wilderness Romance",
    author="Wilderness Romance",
    subject="6-Day New Hampshire Wilderness Road Trip & Marriage Proposal",
    creator="Z.ai")

story = []

# ═══════════════════════════════════════════════════════════════════════
# COVER PAGE
# ═══════════════════════════════════════════════════════════════════════
story.append(Spacer(1, 2*inch))
story.append(Paragraph("J &amp; Dee", cover_title))
story.append(Spacer(1, 0.2*inch))
story.append(Paragraph("The Wilderness Romance", ParagraphStyle('CoverSubtitle2', parent=cover_subtitle, fontSize=22, textColor=PRIMARY)))
story.append(Spacer(1, 0.1*inch))
story.append(Paragraph("A 6-Day New Hampshire Wilderness Road Trip", cover_subtitle))
story.append(Paragraph("&amp; Marriage Proposal", cover_subtitle))
story.append(Spacer(1, 0.4*inch))
story.append(Paragraph("August 4-9, 2026", cover_meta))
story.append(Paragraph("Westborough, MA to Dixville Notch, NH", cover_meta))
story.append(Paragraph(f"{data['tripStats']['totalMiles']} miles | {data['tripStats']['totalDays']} days | {data['tripStats']['majorStops']} stops", cover_meta))
story.append(Spacer(1, 0.3*inch))
story.append(Paragraph("The Big Moment: Friday, August 7, 2026 at 7:30 PM ET", ParagraphStyle('CoverMoment', parent=cover_meta, fontSize=12, textColor=WAX, fontName=BOLD_FONT)))
story.append(Paragraph("Lake Gloriette, Dixville Notch, NH", ParagraphStyle('CoverLoc', parent=cover_meta, fontSize=11, textColor=ACCENT)))
story.append(Spacer(1, 0.5*inch))
story.append(HRFlowable(width="60%", thickness=1, color=BRASS, hAlign='CENTER'))
story.append(Spacer(1, 0.2*inch))
story.append(Paragraph("#JAndDeeSayIDo", ParagraphStyle('CoverTag', parent=cover_meta, fontName=HEAD_FONT, fontSize=14, textColor=BRASS)))
story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════════════
# TABLE OF CONTENTS (simple)
# ═══════════════════════════════════════════════════════════════════════
story.append(Paragraph("Contents", h1))
story.append(Spacer(1, 0.2*inch))
toc_items = [
    "1. Trip Overview",
    "2. The Itinerary — 6 Days of Wilderness Romance",
    "   Day 1: The Off-Grid Escape (Aug 4)",
    "   Day 2: Still Waters & Wildlife (Aug 5)",
    "   Day 3: Powered Preparation (Aug 6)",
    "   Day 4: The Big Proposal Day (Aug 7)",
    "   Day 5: Frontier Horizons & Dark Skies (Aug 8)",
    "   Day 6: The Double-Header Grand Finale (Aug 9)",
    "3. Attraction Catalog — 27 Verified Stops",
    "4. Roadside Gems — 17 Hidden Treasures",
    "5. Pro Tips for the Trail",
    "6. Sources & Citations",
]
for item in toc_items:
    story.append(Paragraph(item, ParagraphStyle('TOC', parent=body, fontSize=11, spaceAfter=4, leftIndent=0 if not item.startswith('   ') else 24)))
story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════════════
# 1. TRIP OVERVIEW
# ═══════════════════════════════════════════════════════════════════════
story.append(Paragraph("1. Trip Overview", h1))

ts = data['tripStats']
overview_text = f"""This document contains the complete itinerary for a 6-day wilderness road trip through New Hampshire, 
spanning {ts['totalMiles']} miles from Westborough, Massachusetts to Dixville Notch, New Hampshire. The journey 
culminates in a marriage proposal at Lake Gloriette on Friday, August 7, 2026 at 7:30 PM Eastern Time, 
where the 1,000-foot granite face of Table Rock turns pink and orange at golden hour across the mirror-calm lake."""
story.append(Paragraph(overview_text, body))
story.append(Spacer(1, 0.15*inch))

# Stats table
stats_data = [
    ['Total Distance', f"{ts['totalMiles']} miles"],
    ['Total Days', str(ts['totalDays'])],
    ['Major Stops', str(ts['majorStops'])],
    ['Drive Legs', str(len(data['driveLegs']))],
    ['Trip Window', 'August 4-9, 2026'],
    ['Proposal Date', 'Friday, August 7, 2026 @ 7:30 PM ET'],
    ['Proposal Location', 'Lake Gloriette, Dixville Notch, NH'],
    ['Coordinates', '44.870 N, -71.305 W'],
]
stats_table = Table(stats_data, colWidths=[1.8*inch, 3.5*inch])
stats_table.setStyle(TableStyle([
    ('FONTNAME', (0,0), (0,-1), BOLD_FONT),
    ('FONTNAME', (1,0), (1,-1), BODY_FONT),
    ('FONTSIZE', (0,0), (-1,-1), 10),
    ('TEXTCOLOR', (0,0), (0,-1), PRIMARY),
    ('TEXTCOLOR', (1,0), (1,-1), BARK),
    ('BACKGROUND', (0,0), (-1,-1), LIGHT_BG),
    ('ROWBACKGROUNDS', (0,0), (-1,-1), [CREAM, PARCHMENT]),
    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#d4c4a4')),
    ('TOPPADDING', (0,0), (-1,-1), 5),
    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ('LEFTPADDING', (0,0), (-1,-1), 8),
]))
story.append(stats_table)
story.append(Spacer(1, 0.2*inch))

# Drive legs
story.append(Paragraph("Drive Legs", h3))
for i, leg in enumerate(data['driveLegs']):
    story.append(Paragraph(f"<b>Leg {i+1}:</b> {leg['from']} to {leg['to']} | {leg['miles']} mi | {leg['duration']} | {leg['day']}", body_indent))

story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════════════
# 2. THE ITINERARY
# ═══════════════════════════════════════════════════════════════════════
story.append(Paragraph("2. The Itinerary", h1))
story.append(Paragraph("Six days of wilderness romance across New Hampshire.", body))
story.append(Spacer(1, 0.15*inch))

for day_idx, day in enumerate(data['dayPlans']):
    # Day header
    story.append(Paragraph(f"Day {day_idx + 1}: {day['title']}", h2))
    story.append(Paragraph(f"<b>{day['date']}</b> | Theme: {day['theme']}", ParagraphStyle('DayMeta', parent=body, fontSize=10, textColor=MUTED, spaceAfter=6)))
    story.append(Paragraph(day['description'], body))
    story.append(Spacer(1, 0.1*inch))

    # Highlights
    if day['highlights']:
        story.append(Paragraph("Highlights", h3))
        for h in day['highlights']:
            story.append(Paragraph(f"&bull; {h}", bullet))
        story.append(Spacer(1, 0.1*inch))

    # Stops
    if day['places']:
        story.append(Paragraph(f"Stops ({len(day['places'])})", h3))
        for stop_idx, place in enumerate(day['places']):
            stop_block = []
            stop_block.append(Paragraph(f"<b>Stop {stop_idx + 1}: {place['name']}</b>", ParagraphStyle('StopTitle', parent=body, fontSize=11, textColor=ACCENT, spaceAfter=3)))

            if place.get('cost'):
                stop_block.append(Paragraph(f"<b>Cost:</b> {place['cost']}", tip))
            if place.get('address'):
                stop_block.append(Paragraph(f"<b>Address:</b> {place['address']}", tip))
            if place.get('checkIn'):
                stop_block.append(Paragraph(f"<b>Check-In:</b> {place['checkIn']}", tip))
            if place.get('checkOut'):
                stop_block.append(Paragraph(f"<b>Check-Out:</b> {place['checkOut']}", tip))
            if place.get('bookingId'):
                stop_block.append(Paragraph(f"<b>Booking ID:</b> {place['bookingId']}", tip))
            if place.get('accessCode'):
                stop_block.append(Paragraph(f"<b>Access Code:</b> {place['accessCode']}", tip))
            if place.get('coords'):
                stop_block.append(Paragraph(f"<b>Coordinates:</b> {place['coords']['lat']:.4f} N, {place['coords']['lng']:.4f} W", tip))

            stop_block.append(Spacer(1, 3))
            stop_block.append(Paragraph(place['description'], body_indent))

            if place.get('highlights'):
                stop_block.append(Spacer(1, 3))
                stop_block.append(Paragraph("<b>Highlights:</b>", tip))
                for h in place['highlights']:
                    stop_block.append(Paragraph(f"&bull; {h}", bullet))

            if place.get('tips'):
                stop_block.append(Spacer(1, 3))
                stop_block.append(Paragraph("<b>Pro Tips:</b>", tip))
                for t in place['tips']:
                    stop_block.append(Paragraph(f"&bull; {t}", bullet))

            story.append(KeepTogether(stop_block))
            story.append(Spacer(1, 0.15*inch))

    story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════════════
# 3. ATTRACTION CATALOG
# ═══════════════════════════════════════════════════════════════════════
story.append(Paragraph("3. Attraction Catalog", h1))
story.append(Paragraph(f"{len(data['catalog'])} verified stops sourced from official websites and trusted databases. Citations follow APA format.", body))
story.append(Spacer(1, 0.15*inch))

# Group by type
types = {}
for entry in data['catalog']:
    t = entry.get('type', 'other')
    if t not in types:
        types[t] = []
    types[t].append(entry)

for type_name, entries in sorted(types.items()):
    story.append(Paragraph(type_name.replace('-', ' ').title(), h3))
    for entry in entries:
        cat_block = []
        cat_block.append(Paragraph(f"<b>{entry['name']}</b>", ParagraphStyle('CatTitle', parent=body, fontSize=10.5, textColor=PRIMARY, spaceAfter=2)))
        if entry.get('tagline'):
            cat_block.append(Paragraph(f"<i>{entry['tagline']}</i>", ParagraphStyle('CatTag', parent=tip, fontSize=9, textColor=MUTED, spaceAfter=3)))
        cat_block.append(Paragraph(f"Cost: {entry.get('cost', 'N/A')} | Detour: +{entry.get('detourMinutes', '?')} min | Difficulty: {entry.get('difficulty', 'N/A')}", tip))
        cat_block.append(Paragraph(entry.get('description', ''), body_indent))
        if entry.get('address'):
            cat_block.append(Paragraph(f"Address: {entry['address']}", tip))
        if entry.get('phone'):
            cat_block.append(Paragraph(f"Phone: {entry['phone']}", tip))
        if entry.get('website'):
            cat_block.append(Paragraph(f"Website: {entry['website']}", tip))
        if entry.get('source'):
            cat_block.append(Paragraph(f"Source: {entry['source']}", source_style))
        story.append(KeepTogether(cat_block))
        story.append(Spacer(1, 0.1*inch))

story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════════════
# 4. ROADSIDE GEMS
# ═══════════════════════════════════════════════════════════════════════
story.append(Paragraph("4. Roadside Gems", h1))
story.append(Paragraph(f"{len(data['roadside'])} hidden treasures along the route, sorted by detour time.", body))
story.append(Spacer(1, 0.15*inch))

for gem in sorted(data['roadside'], key=lambda x: x.get('detourMinutes', 999)):
    gem_block = []
    gem_block.append(Paragraph(f"<b>{gem['name']}</b>", ParagraphStyle('GemTitle', parent=body, fontSize=10.5, textColor=ACCENT, spaceAfter=2)))
    gem_block.append(Paragraph(f"<i>{gem.get('tagline', '')}</i>", ParagraphStyle('GemTag', parent=tip, fontSize=9, textColor=MUTED, spaceAfter=2)))
    gem_block.append(Paragraph(f"Cost: {gem.get('cost', 'N/A')} | Detour: +{gem.get('detourMinutes', '?')} min | Duration: {gem.get('visitDuration', 'N/A')}", tip))
    if gem.get('hiddenGem'):
        gem_block.append(Paragraph("Hidden Gem!", ParagraphStyle('GemBadge', parent=tip, fontSize=9, textColor=BRASS, fontName=BOLD_FONT)))
    if gem.get('dogFriendly'):
        gem_block.append(Paragraph("Dog OK", tip))
    if gem.get('restrooms'):
        gem_block.append(Paragraph("Restrooms available", tip))
    gem_block.append(Paragraph(gem.get('description', ''), body_indent))
    if gem.get('address'):
        gem_block.append(Paragraph(f"Address: {gem['address']}", tip))
    story.append(KeepTogether(gem_block))
    story.append(Spacer(1, 0.08*inch))

story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════════════
# 5. PRO TIPS
# ═══════════════════════════════════════════════════════════════════════
story.append(Paragraph("5. Pro Tips for the Trail", h1))
story.append(Spacer(1, 0.15*inch))

for i, tip_item in enumerate(data['proTips']):
    tip_block = []
    tip_block.append(Paragraph(f"<b>Tip {i+1}: {tip_item.get('title', '')}</b>", ParagraphStyle('TipTitle', parent=body, fontSize=11, textColor=PRIMARY, spaceAfter=4)))
    tip_block.append(Paragraph(tip_item.get('text', ''), body))
    story.append(KeepTogether(tip_block))
    story.append(Spacer(1, 0.15*inch))

story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════════════
# 6. SOURCES & CITATIONS
# ═══════════════════════════════════════════════════════════════════════
story.append(Paragraph("6. Sources & Citations", h1))
story.append(Paragraph("All attraction data is sourced from official websites and trusted databases. Citations follow APA format.", body))
story.append(Spacer(1, 0.15*inch))

for source in data['sources']:
    src_block = []
    src_block.append(Paragraph(f"<b>[{source['id']}]</b> {source['citation']}", source_style))
    src_block.append(Paragraph(f"<i>{source['url']}</i>", ParagraphStyle('SrcURL', parent=source_style, fontSize=8, textColor=ACCENT)))
    story.append(KeepTogether(src_block))
    story.append(Spacer(1, 4))

# ── Build PDF ─────────────────────────────────────────────────────────
doc.build(story)

# Stats
file_size = os.path.getsize(OUTPUT)
print(f"\nPDF generated: {OUTPUT}")
print(f"File size: {file_size / 1024:.1f} KB")
print(f"Content: {len(data['dayPlans'])} days, {sum(len(d['places']) for d in data['dayPlans'])} places, {len(data['catalog'])} catalog entries, {len(data['roadside'])} roadside gems, {len(data['proTips'])} pro tips, {len(data['sources'])} sources")
