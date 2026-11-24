import json,collections,html
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Table,TableStyle,PageBreak,KeepTogether
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT,TA_CENTER
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
ROOT=Path('/Users/alo/Downloads/tlato-calculadora 2')
a=json.loads((ROOT/'tmp/pdfs/analisis.json').read_text())['analysis']
names={'AMC':'Arturo Montes Cuervo','BBAY':'Bernabe Bernabe Ángel Yahir','CAE':'Camacho Angel Emmanuel','CBC':'Barrera Chávez Camila','CAM':'Cristian Anastasio','FVP':'Fernanda Velasco Pérez','KNLI':'Karla Naomi Luna Ibañez','MEAM':'Monserrat Elian Alcantara Macias','JAMR':'José Alonso Mota Rios','ANND':'Nuño Díaz Alexia Naomi','OML':'Oswaldo Moreno Lorenzo','PLB':'Paola Liñan','PVCY':'Puga Valencia Carlos Yael','RVS':'Rafael Villasana','TCL':'Torres Cortes Leilani','XPRL':'Ximena Patricia Rubio Lira','YNGR':'Yuridia Nicole González Raya','AJMC':'Aidan Jusafat Martinez','VMV':'Vladimir Melchor Valerio','LENIN':'Méndez Sánchez Lenin Uziel'}
people={k:{'name':v,'code':k,'ex':[0,0],'rev':[set(),set()]} for k,v in names.items()}
for g in a['groups']:people[g['code']]['ex']=[len(x) for x in g['ids']]
for r in a['reviews']:
 k='CAE' if r['code']=='EMMANUEL' else r['code']
 for i in range(2):people[k]['rev'][i].update(r['cases'][i])
people['LENIN']['code']='MSLU'
people['LENIN']['ex']=[15,0]
for p in people.values():
 p['rc']=[len(s) for s in p['rev']];acts=[]
 if p['code'] in ['JAMR','YNGR']:acts.append('Programación')
 if sum(p['ex']):acts.append('Realizó problemas')
 if sum(p['rc']):acts.append('Revisó problemas')
 if p['code'] in ['CAM','CAE']:acts.append('Desarrollo de base de datos')
 if p['code'] in ['JAMR','YNGR']:
  acts=['Programación','Revisión de ejercicios','Supervisión de la construcción de base de datos','Supervisión de ejercicios manuales','Realización de ejercicios']
 p['activity_count']=len(acts)
 p['acts']='; '.join(acts)
assert sum(sum(p['ex']) for p in people.values())==341
assert sum(sum(p['rc']) for p in people.values())==318
pdfmetrics.registerFont(TTFont('Arial','/System/Library/Fonts/Supplemental/Arial.ttf'))
pdfmetrics.registerFont(TTFont('Arial-Bold','/System/Library/Fonts/Supplemental/Arial Bold.ttf'))
navy=colors.HexColor('#082A4A');blue=colors.HexColor('#156A88');gray=colors.HexColor('#526474');light=colors.HexColor('#EEF4F8')
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='BodyA',fontName='Arial',fontSize=10,leading=14,textColor=navy,spaceAfter=9))
styles.add(ParagraphStyle(name='TitleA',fontName='Arial-Bold',fontSize=25,leading=29,textColor=navy,spaceAfter=12))
styles.add(ParagraphStyle(name='SubA',fontName='Arial-Bold',fontSize=14,leading=18,textColor=blue,spaceAfter=10))
styles.add(ParagraphStyle(name='SmallA',fontName='Arial',fontSize=8.2,leading=11,textColor=gray,spaceAfter=6))
styles.add(ParagraphStyle(name='CellA',fontName='Arial',fontSize=9,leading=12,textColor=navy))
styles.add(ParagraphStyle(name='HeadA',fontName='Arial-Bold',fontSize=8.5,leading=11,textColor=colors.white))
def P(x,sty='BodyA'):return Paragraph(x,styles[sty])
def table(rows,widths,header=True,small=False):
 vals=[[P(str(v),'HeadA' if i==0 and header else ('SmallA' if small else 'CellA')) for v in row] for i,row in enumerate(rows)]
 t=Table(vals,colWidths=widths,repeatRows=1 if header else 0,hAlign='LEFT')
 cmds=[('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),5 if small else 7),('BOTTOMPADDING',(0,0),(-1,-1),5 if small else 7),('LINEBELOW',(0,0),(-1,0),.5,navy)]
 if header:cmds += [('BACKGROUND',(0,0),(-1,0),navy),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,light])]
 t.setStyle(TableStyle(cmds));return t
def page(c,doc):
 c.saveState();w,h=doc.pagesize
 c.drawImage(str(ROOT/'assets/tlato-limpio.png'),43,h-82,width=43,height=43,mask='auto',preserveAspectRatio=True)
 c.setFillColor(navy);c.setFont('Arial-Bold',12);c.drawString(98,h-55,'TLATO CALCULADORA')
 c.setFillColor(gray);c.setFont('Arial',8);c.drawString(98,h-70,'Reporte de participaciones | Corte: 24 de noviembre de 2026')
 c.setStrokeColor(colors.HexColor('#CCDCE7'));c.line(43,h-94,w-43,h-94)
 c.setFont('Arial',7.5)
 c.drawRightString(w-43,27,f'{doc.page}');c.restoreState()
out=ROOT/'output/pdf/Reporte_de_participaciones_Tlato_2026-11-24.pdf'
doc=SimpleDocTemplate(str(out),title='Reporte de participaciones - Tlato Calculadora',author='Tlato Calculadora',pagesize=(595.28,841.89),leftMargin=43,rightMargin=43,topMargin=112,bottomMargin=46)
W=509.28
ordered=sorted(people.values(),key=lambda p:(-p['activity_count'],-sum(p['ex'])-sum(p['rc']),p['name'].lower()))
story=[P('Integrantes y actividad realizada','TitleA'),table([['Integrantes','Actividad realizada']]+[[p['name'],p['acts']] for p in ordered],[218,W-218]),PageBreak(),P('Participación por integrante','TitleA'),P('H1: Respuestas de formulario 1 · H2: Respuestas de formulario 2','SmallA')]
rows=[['Integrantes','Letras<br/>del ID','Realizó<br/>H1','Realizó<br/>H2','Total<br/>realizó','Revisó<br/>H1','Revisó<br/>H2','Total<br/>revisó']]
for p in sorted(people.values(),key=lambda p:(-sum(p['ex']),p['name'])):
 rows.append([p['name'],p['code'] if p['code']!='LENIN' else '-',*p['ex'],sum(p['ex']),*p['rc'],sum(p['rc'])])
rows.append(['TOTAL','',264,77,341,250,68,318])
story.append(table(rows,[159,42,51,51,53,51,51,51],small=True))
doc.build(story,onFirstPage=page,onLaterPages=page)
print(out)
