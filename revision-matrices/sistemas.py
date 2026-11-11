from pathlib import Path
from fractions import Fraction as F
import json
from PIL import Image,ImageDraw,ImageFont
base=Path(__file__).parent
A=[
[[1,-2,1,3,4],[2,-3,3,7,10],[1,-2,2,4,6]],
[[3,1,-2,1,2],[6,3,-3,3,7],[3,2,-1,2,5]],
[[1,4,-1,2,5],[2,9,-1,5,12],[1,5,0,1,7]],
[[1,2,-1,1,3,5],[2,5,-1,3,7,12],[1,3,0,2,4,7]],
[[2,1,3,-1,2,4],[4,1,7,1,5,11],[2,0,4,2,3,7]],
[[1,-1,1,2,-1,1],[3,-2,4,5,-1,5],[2,-1,3,3,0,4]],
[[1,2,1,-1,3],[2,7,5,3,17],[1,4,4,3,11],[3,10,8,5,25]],
[[2,1,1,2,6],[1,-1,2,1,3],[3,0,3,3,9],[1,2,-1,1,3]],
[[1,2,3,-1,4],[2,5,7,-1,10],[1,3,5,2,8],[3,7,11,3,16]],
[[1,1,4,5],[2,3,9,12],[1,2,5,7],[3,4,13,17]],
[[2,2,-1,3],[4,5,-1,8],[2,3,0,5],[6,7,-2,11]],
[[1,-3,2,0],[3,-8,5,1],[2,-5,3,1],[4,-11,7,1]],
[[1,3,1,5],[2,7,3,12],[1,4,2,7],[3,10,4,17],[4,13,5,22]],
[[2,-1,2,3],[4,-1,5,8],[2,3,0,5],[6,-2,7,11],[8,-3,9,14]],
[[1,1,-2,0],[2,3,-3,2],[1,2,-1,2],[3,4,-5,2],[4,5,-7,2]],
]
R=[
[[1,0,0,2,2],[0,1,0,0,0],[0,0,1,1,2]],
[[1,0,-1,0,F(-1,3)],[0,1,1,1,3],[0,0,0,0,0]],
[[1,0,-5,0,-3],[0,1,1,0,2],[0,0,0,1,0]],
[[1,0,-3,-1,1,1],[0,1,1,1,1,2],[0,0,0,0,0,0]],
[[1,0,2,1,F(3,2),F(7,2)],[0,1,-1,-3,-1,-3],[0,0,0,0,0,0]],
[[1,0,2,1,1,3],[0,1,1,-1,2,2],[0,0,0,0,0,0]],
[[1,0,0,0,0],[0,1,0,0,2],[0,0,1,0,0],[0,0,0,1,1]],
[[1,-1,2,1,3],[0,1,-1,0,0],[0,0,0,0,0],[0,0,0,0,0]],
[[1,0,0,0,-2],[0,1,0,0,0],[0,0,1,0,2],[0,0,0,1,0]],
[[1,0,3,3],[0,1,1,2],[0,0,0,0],[0,0,0,0]],
[[1,0,F(-3,2),F(-1,2)],[0,1,1,2],[0,0,0,0],[0,0,0,0]],
[[1,0,-1,3],[0,1,-1,1],[0,0,0,0],[0,0,0,0]],
[[1,0,-2,-1],[0,1,1,2],[0,0,0,0],[0,0,0,0],[0,0,0,0]],
[[1,0,0,1],[0,1,0,1],[0,0,1,1],[0,0,0,0],[0,0,0,0]],
[[1,0,-3,-2],[0,1,1,2],[0,0,0,0],[0,0,0,0],[0,0,0,0]],
]
def rref(a):
 a=[[F(v) for v in row] for row in a];r=0
 for c in range(len(a[0])):
  p=next((p for p in range(r,len(a)) if a[p][c]),None)
  if p is None:continue
  a[r],a[p]=a[p],a[r];v=a[r][c];a[r]=[v2/v for v2 in a[r]]
  for j in range(len(a)):
   if j!=r:
    v=a[j][c];a[j]=[x-v*y for x,y in zip(a[j],a[r])]
  r+=1
  if r==len(a):break
 return a
font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Times New Roman.ttf',52)
head=ImageFont.truetype('/System/Library/Fonts/Supplemental/Times New Roman.ttf',38)
for i,(a,b) in enumerate(zip(A,R),1):
 
 assert rref(a)==rref(b),f'No coincide JAMR{i:02d}'
 lines=[]
 for row in a:
  terms=[]
  for j,v in enumerate(row[:-1],1):
   if not v:continue
   term=('' if abs(v)==1 else str(abs(v)))+f'x{j}'
   terms.append(('− ' if v<0 else ('+ ' if terms else ''))+term)
  lines.append(' '.join(terms)+' = '+str(row[-1]))
 im=Image.new('RGB',(1200,180+len(a)*100),'white');d=ImageDraw.Draw(im)
 d.text((50,35),f'JAMR{i:02d} — Sistema {len(a)} × {len(a[0])-1}',font=head,fill='black')
 for j,line in enumerate(lines):d.text((90,135+j*100),line,font=font,fill='black')
 im.save(base/'archivos'/f'JAMR{i:02d}'/'sistema.png')
(base/'verificacion.json').write_text(json.dumps({'casos':15,'sistemas_equivalentes_a_resultados':15,'matrices':A,'adaptado':'JAMR10: coeficientes de x3 adaptados al resultado fotografiado. Fotos originales preservadas.'},indent=2))
print('15 sistemas comprobados con fracciones exactas y renderizados')
