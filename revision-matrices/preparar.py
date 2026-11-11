from pathlib import Path
import subprocess,json
from PIL import Image,ImageDraw,ImageFont
base=Path(__file__).parent
out=base/'archivos';out.mkdir(exist_ok=True)
def src(n):
 p=Path(f'/Users/alo/Downloads/IMG_{n}.jpg')
 return p if p.exists() else base/'previews'/f'IMG_{n}.jpg'
def crop(p,box,dest):
 w,h=Image.open(p).size
 l,t,r,b=[round(v*s) for v,s in zip(box,[w,h,w,h])]
 Image.open(p).convert('RGB').crop((l,t,r,b)).save(dest)
s1=s2=s3=None
spec=[
 (2370,(0,0,1,1),2371,(.04,.25,.97,.80),s1,(.03,.24,.90,.57)),
 (2372,(0,0,1,1),2373,(.03,.30,.90,.84),s1,(.03,.63,.90,.97)),
 (2374,(0,.22,1,1),2376,(.10,.27,.85,.75),s2,(.06,.005,.96,.12)),
 (2378,(0,0,1,1),2379,(.06,.03,.92,.94),s2,(.06,.165,.97,.27)),
 (2380,(0,0,1,.73),2381,(.05,.08,.93,.80),s2,(.06,.285,.99,.39)),
 (2382,(0,0,1,1),2383,(.13,.20,.90,.60),s2,(.06,.41,.99,.51)),
 (2384,(0,.15,1,.89),2385,(.12,.16,.79,.60),s2,(.06,.56,.99,.69)),
 (2386,(0,.04,1,.60),2387,(.005,.04,.89,.70),s2,(.06,.70,.99,.84)),
 (2388,(0,.14,1,.88),2389,(.05,.06,.98,.75),s2,(.06,.85,.99,.99)),
 (2390,(0,.09,1,.60),2391,(.13,.22,.75,.71),None,None),
 (2393,(0,0,1,.94),2394,(.08,.10,.90,.69),s3,(.06,.185,.99,.32)),
 (2395,(0,0,1,1),2396,(.15,.32,.81,.79),s3,(.06,.33,.99,.46)),
 (2397,(0,0,1,1),2398,(.08,.06,.94,.83),s3,(.06,.51,.99,.66)),
 (2399,(0,0,1,.96),2400,(.26,.03,.97,.81),s3,(.06,.67,.99,.83)),
 (2401,(0,.075,1,1),2402,(.19,.20,.88,.85),s3,(.06,.845,.99,.995)),
]
manifest=[]
for i,(pn,pb,rn,rb,ss,sb) in enumerate(spec,1):
 code=f'JAMR{i:02d}';folder=out/code;folder.mkdir(exist_ok=True)
 crop(src(pn),pb,folder/'procedimiento.jpg');crop(src(rn),rb,folder/'resultado.jpg')
 if ss:crop(ss,sb,folder/'sistema.png')
 else:
  im=Image.new('RGB',(1100,470),'white');d=ImageDraw.Draw(im);font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Times New Roman.ttf',44)
  for j,line in enumerate(['Sistema de 4 ecuaciones con 3 incognitas','x1 + x2 + 4x3 = 5','2x1 + 3x2 + 9x3 = 12','x1 + 2x2 + 5x3 = 7','3x1 + 4x2 + 13x3 = 17']):d.text((45,25+85*j),line,font=font,fill='black')
  im.save(folder/'sistema.png')
 manifest.append({'id':code,'ejercicio':30+i,'dimension':['3x4','3x5','4x4','4x3','5x3'][(i-1)//3],'files':{k:str((folder/f).resolve()) for k,f in [('sistema','sistema.png'),('procedimiento','procedimiento.jpg'),('resultado','resultado.jpg')]}})
(base/'manifest.json').write_text(json.dumps(manifest,indent=2))
print('45 archivos preparados')
