#!/usr/bin/env node
/* Deterministic 1200x630 guide/social PNGs. No external packages or binaries. */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const out = path.join(process.cwd(), 'assets', 'img');
const W = 1200, H = 630;
const FONT = {
  'A':['01110','10001','10001','11111','10001','10001','10001'],'B':['11110','10001','10001','11110','10001','10001','11110'],'C':['01111','10000','10000','10000','10000','10000','01111'],'D':['11110','10001','10001','10001','10001','10001','11110'],'E':['11111','10000','10000','11110','10000','10000','11111'],'F':['11111','10000','10000','11110','10000','10000','10000'],'G':['01111','10000','10000','10111','10001','10001','01111'],'H':['10001','10001','10001','11111','10001','10001','10001'],'I':['11111','00100','00100','00100','00100','00100','11111'],'J':['00111','00010','00010','00010','00010','10010','01100'],'K':['10001','10010','10100','11000','10100','10010','10001'],'L':['10000','10000','10000','10000','10000','10000','11111'],'M':['10001','11011','10101','10101','10001','10001','10001'],'N':['10001','11001','10101','10011','10001','10001','10001'],'O':['01110','10001','10001','10001','10001','10001','01110'],'P':['11110','10001','10001','11110','10000','10000','10000'],'Q':['01110','10001','10001','10001','10101','10010','01101'],'R':['11110','10001','10001','11110','10100','10010','10001'],'S':['01111','10000','10000','01110','00001','00001','11110'],'T':['11111','00100','00100','00100','00100','00100','00100'],'U':['10001','10001','10001','10001','10001','10001','01110'],'V':['10001','10001','10001','10001','10001','01010','00100'],'W':['10001','10001','10001','10101','10101','10101','01010'],'X':['10001','10001','01010','00100','01010','10001','10001'],'Y':['10001','10001','01010','00100','00100','00100','00100'],'Z':['11111','00001','00010','00100','01000','10000','11111'],'0':['01110','10001','10011','10101','11001','10001','01110'],'1':['00100','01100','00100','00100','00100','00100','01110'],'2':['01110','10001','00001','00010','00100','01000','11111'],'3':['11110','00001','00001','01110','00001','00001','11110'],'4':['00010','00110','01010','10010','11111','00010','00010'],'5':['11111','10000','10000','11110','00001','00001','11110'],'6':['01110','10000','10000','11110','10001','10001','01110'],'7':['11111','00001','00010','00100','01000','01000','01000'],'8':['01110','10001','10001','01110','10001','10001','01110'],'9':['01110','10001','10001','01111','00001','00001','01110'],'-':['00000','00000','00000','11111','00000','00000','00000'],'&':['01100','10010','10100','01000','10101','10010','01101'],'.':['00000','00000','00000','00000','00000','01100','01100'],':':['00000','01100','01100','00000','01100','01100','00000'],'/':['00001','00010','00100','01000','10000','00000','00000'],' ' :['00000','00000','00000','00000','00000','00000','00000']
};
function crc32(b){let c=~0;for(let i=0;i<b.length;i++){c^=b[i];for(let k=0;k<8;k++)c=(c>>>1)^(0xEDB88320&-(c&1));}return(~c)>>>0;}
function chunk(t,d){const n=Buffer.alloc(4);n.writeUInt32BE(d.length);const b=Buffer.concat([Buffer.from(t),d]);const c=Buffer.alloc(4);c.writeUInt32BE(crc32(b));return Buffer.concat([n,b,c]);}
function png(px){const raw=Buffer.alloc((W*4+1)*H);for(let y=0;y<H;y++){const row=y*(W*4+1);raw[row]=0;px.copy(raw,row+1,y*W*4,(y+1)*W*4);}const h=Buffer.alloc(13);h.writeUInt32BE(W);h.writeUInt32BE(H,4);h[8]=8;h[9]=6;return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',h),chunk('IDAT',zlib.deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))]);}
function canvas(colors){const p=Buffer.alloc(W*H*4);for(let y=0;y<H;y++)for(let x=0;x<W;x++){const t=(x/W*.55+y/H*.45);const r=Math.round(colors[0][0]*(1-t)+colors[1][0]*t),g=Math.round(colors[0][1]*(1-t)+colors[1][1]*t),b=Math.round(colors[0][2]*(1-t)+colors[1][2]*t),i=(y*W+x)*4;p[i]=r;p[i+1]=g;p[i+2]=b;p[i+3]=255;}return p;}
function blend(p,x,y,r,g,b,a){if(x<0||y<0||x>=W||y>=H)return;const i=(y*W+x)*4,al=a/255,inv=1-al;p[i]=Math.round(p[i]*inv+r*al);p[i+1]=Math.round(p[i+1]*inv+g*al);p[i+2]=Math.round(p[i+2]*inv+b*al);}
function circle(p,cx,cy,rad,col,a){for(let y=Math.max(0,cy-rad);y<=Math.min(H-1,cy+rad);y++)for(let x=Math.max(0,cx-rad);x<=Math.min(W-1,cx+rad);x++){const d=Math.hypot(x-cx,y-cy);if(d<=rad)blend(p,x,y,col[0],col[1],col[2],Math.round(a*(1-d/rad*.6)));}}
function rect(p,x,y,w,h,col,a){for(let yy=Math.max(0,y);yy<Math.min(H,y+h);yy++)for(let xx=Math.max(0,x);xx<Math.min(W,x+w);xx++)blend(p,xx,yy,col[0],col[1],col[2],a);}
function text(p,str,x,y,scale,col){let xx=x;for(const char of str.toUpperCase()){const glyph=FONT[char]||FONT[' '];for(let gy=0;gy<7;gy++)for(let gx=0;gx<5;gx++)if(glyph[gy][gx]==='1')rect(p,xx+gx*scale,y+gy*scale,scale,scale,col,255);xx+=6*scale;}return xx;}
function lineWrap(str,max){const words=str.split(' '), lines=[];let line='';for(const word of words){const trial=line?line+' '+word:word;if(trial.length>max){if(line)lines.push(line);line=word;}else line=trial;}if(line)lines.push(line);return lines;}
const guides=[
 ['blog-debt-snowball-avalanche.png','DEBT SNOWBALL','VS AVALANCHE',[15,21,51],[25,88,132],[0,194,168]],
 ['blog-credit-card-payoff.png','CREDIT CARD','PAYOFF PLAN',[49,20,48],[116,34,77],[251,191,36]],
 ['blog-home-loan-refinance.png','REFINANCE OR','BALANCE TRANSFER',[15,48,79],[29,100,135],[124,211,255]],
 ['blog-expense-ratio-impact.png','EXPENSE RATIO','COMPOUNDING IMPACT',[21,55,46],[19,108,89],[0,194,168]],
 ['blog-retirement-withdrawal.png','RETIREMENT','WITHDRAWAL PLAN',[49,36,77],[82,58,130],[251,191,36]],
 ['blog-bond-ytm.png','BOND YIELD','VS YTM',[25,42,85],[38,86,136],[124,211,255]],
 /* USA cluster #1 */
 ['blog-compound-interest.png','COMPOUND','INTEREST GUIDE',[13,32,60],[25,83,132],[0,194,168]],
 ['blog-mortgage-payment.png','MORTGAGE','PAYMENT GUIDE',[15,48,79],[24,82,120],[251,191,36]],
 ['blog-paycheck-salary.png','SALARY TO','PAYCHECK GUIDE',[20,44,80],[35,90,140],[0,194,168]],
 ['blog-15-vs-30-mortgage.png','15-YEAR OR','30-YEAR MORTGAGE',[33,28,48],[80,42,104],[251,191,36]],
 ['blog-simple-vs-compound.png','SIMPLE VS','COMPOUND INTEREST',[12,42,72],[24,100,136],[0,194,168]],
 ['blog-ten-thousand-grow.png','HOW MUCH WILL','$10,000 GROW?',[24,42,86],[40,96,140],[251,191,36]],
	 /* Clean legacy feature images */
	 ['blog-health-insurance-cover.png','HEALTH INSURANCE','COVER GUIDE',[8,117,109],[19,181,157],[218,255,247],{clean:true}],
	 ['blog-rent-vs-buy-2026.png','RENT OR BUY','A HOUSE IN 2026',[116,80,23],[220,150,33],[255,239,190],{clean:true}],
	 /* USA cluster #2 */
	 ['blog-loan-interest.png','HOW TO CALCULATE','LOAN INTEREST',[18,35,68],[36,92,132],[0,194,168]],
	 ['blog-gross-vs-net-pay.png','GROSS PAY VS','NET PAY',[20,47,73],[42,102,139],[251,191,36]],
	 ['blog-how-much-house.png','HOW MUCH HOUSE','CAN I AFFORD?',[20,47,73],[47,93,126],[124,211,255]],
	 ['blog-investment-return.png','INVESTMENT','RETURN GUIDE',[18,55,48],[30,111,89],[0,194,168]],
	 ['blog-percentage-change.png','PERCENTAGE','CHANGE GUIDE',[52,31,73],[93,55,128],[251,191,36]],
	 ['blog-discount-calculator.png','HOW TO CALCULATE','A DISCOUNT',[49,35,44],[119,59,77],[255,194,82]],
	 /* USA cluster #3 */
	 ['blog-inflation-rate.png','INFLATION','RATE GUIDE',[30,50,75],[52,112,152],[0,194,168]],
	 ['blog-savings-rate.png','SAVINGS','RATE & FIRE',[14,55,44],[24,120,88],[0,194,168]],
	 ['blog-apr-vs-apy.png','APR VS APY','WHICH RATE?',[55,28,48],[100,48,92],[251,191,36]],
	 ['blog-401k-vs-roth-ira.png','401K VS','ROTH IRA',[14,42,80],[28,96,144],[124,211,255]]
];
fs.mkdirSync(out,{recursive:true});
for(const [file,top,bottom,a,b,accent,opts] of guides){const p=canvas([a,b]);if(!opts||!opts.clean){circle(p,1010,150,320,accent,60);circle(p,1000,480,230,[255,255,255],24);for(let i=0;i<5;i++){const x=760+i*78, h=90+i*45;rect(p,x,430-h,48,h,accent,150);}}rect(p,72,68,150,7,accent,255);text(p,'DECIDECAL',72,96,6,[240,248,255]);text(p,'FREE FINANCE GUIDE',72,150,3,accent);let y=240;for(const line of lineWrap(top,15)){text(p,line,72,y,11,[255,255,255]);y+=90;}for(const line of lineWrap(bottom,17)){text(p,line,72,y,9,accent);y+=72;}text(p,'CALCULATE BEFORE YOU DECIDE',72,560,3,[230,240,255]);fs.writeFileSync(path.join(out,file),png(p));console.log('Wrote '+file);}
