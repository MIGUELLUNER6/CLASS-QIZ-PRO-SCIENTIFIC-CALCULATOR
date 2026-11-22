const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let expr="",ans=0,angle="DEG",mode="COMP",memory=0,powered=true,shift=false,alpha=false;
let history=JSON.parse(localStorage.getItem("cw_history")||"[]");
const panel=$("#modePanel"),out=(s,t)=>{const el=$("#"+s);if(el)el.textContent=String(t)};
function status(t){out("#lcdStatus",t)}
function display(){out("#lcdExpr",expr||"0");out("#lcdResult",ans);out("#angleTag",angle);out("#modeTag",mode);out("#battery",powered?"● ON":"○ OFF")}
function add(v){if(!powered)return;expr+=v;out("#lcdExpr",expr)}
function factorial(n){if(n<0||!Number.isInteger(n)||n>170)throw Error("Factorial requires integer 0–170");let r=1;for(let i=2;i<=n;i++)r*=i;return r}
function trig(n,x){let z=angle==="DEG"?x*Math.PI/180:x;return Math[n](z)}
function invtrig(n,x){let z=Math[n](x);return angle==="DEG"?z*180/Math.PI:z}
function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b)[a,b]=[b,a%b];return a}
function primeFactors(n){n=Math.abs(Math.trunc(n));if(n<2)return [n];let a=[];for(let p=2;p*p<=n;p++)while(n%p===0){a.push(p);n/=p}if(n>1)a.push(n);return a}
function erf(x){let s=x<0?-1:1;x=Math.abs(x);let t=1/(1+0.3275911*x);let y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x);return s*y}
function choose(n,r){if(r<0||r>n||!Number.isInteger(n)||!Number.isInteger(r))return 0;r=Math.min(r,n-r);let z=1;for(let i=1;i<=r;i++)z=z*(n-r+i)/i;return Math.round(z)}
function evaluate(s,scope={}){if(!window.math)throw Error("Math engine failed to load. Check internet and reload.");
 const sc={Ans:ans,M:memory,pi:Math.PI,e:Math.E,i:math.complex(0,1),sin:x=>trig("sin",x),cos:x=>trig("cos",x),tan:x=>trig("tan",x),asin:x=>invtrig("asin",x),acos:x=>invtrig("acos",x),atan:x=>invtrig("atan",x),log:Math.log10,ln:Math.log,sqrt:Math.sqrt,cbrt:Math.cbrt,exp:Math.exp,abs:Math.abs,floor:Math.floor,ceil:Math.ceil,mod:(a,b)=>a%b,factorial, nCr:choose,nPr:(n,r)=>choose(n,r)*factorial(r),gcd,lcm:(a,b)=>Math.abs(a*b)/gcd(a,b),rand:Math.random,...scope};
 s=s.replace(/(\d+(?:\.\d+)?)!/g,"factorial($1)");return math.evaluate(s,sc)}
function saveHistory(expression,result){history.unshift({expression,result:String(result),time:new Date().toLocaleString()});history=history.slice(0,150);localStorage.setItem("cw_history",JSON.stringify(history));renderHistory();out("#lcdHistory",expression+" = "+result)}
function calculate(){if(!powered||!expr.trim())return;let old=expr;try{let v=evaluate(expr);ans=v;let shown=v?.toString?v.toString():String(v);out("#lcdResult",shown);saveHistory(old,shown);expr="";out("#lcdExpr","");status("Calculation complete")}catch(e){status(e.message||"Math error");out("#lcdResult","Math ERROR")}}
function renderHistory(){let h=$("#historyList");if(!h)return;h.innerHTML=history.length?history.map((x,i)=>`<div class="history-item"><div><div>${esc(x.expression)} = <b>${esc(x.result)}</b></div><small>${esc(x.time)}</small></div><button data-recall="${i}">Recall</button></div>`).join(""):"<p>No calculations yet.</p>";$$("[data-recall]").forEach(b=>b.onclick=()=>{expr=history[+b.dataset.recall].expression;out("#lcdExpr",expr);$("#historyPanel").classList.add("hidden")})}
function esc(x){return String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function clear(){expr="";out("#lcdExpr","0");out("#lcdResult","0");status("Ready")}
function panelHTML(title,desc,fields,buttons){return `<h3>${title}</h3><p>${desc}</p><div class="controls">${fields||""}${buttons||""}</div><div class="output" id="modeOutput">Ready</div>`}
const inp=(id,ph,val="")=>`<input id="${id}" placeholder="${ph}" value="${val}">`,btn=(id,label)=>`<button id="${id}">${label}</button>`;
function renderMode(){
 const configs={
 COMP:()=>`<h3>COMP • General scientific calculations</h3><p>Arithmetic, nested brackets, complex values, trigonometry, inverse trigonometry, logarithms, powers, roots, factorials, permutations, combinations, gcd, lcm and constants.</p><p>Examples: <b>nCr(10,3)</b>, <b>sin(30)</b>, <b>(2+3*i)/(1-i)</b>, <b>gcd(48,18)</b>.</p>`,
 COMPLEX:()=>panelHTML("CMPLX • Complex numbers","Use i for the imaginary unit. Enter expressions such as (2+3*i)/(1-i).",inp("complexExpr","Complex expression","(2+3*i)/(1-i)"),btn("complexRun","Evaluate")),
 STAT:()=>panelHTML("STAT • Statistics and regression","Enter paired x and y data separated by commas. Choose one-variable statistics or linear regression.",inp("statX","Data x: 2,4,6,8","2,4,6,8")+inp("statY","Data y (optional)","3,5,7,9"),btn("statRun","Calculate")),
 TABLE:()=>panelHTML("TABLE • Function table","Define a function in x and generate values across a range.",inp("fn","f(x)","x^2-2*x+1")+inp("tStart","Start","-3")+inp("tEnd","End","5")+inp("tStep","Step","1"),btn("tableRun","Generate table")),
 MATRIX:()=>panelHTML("MATRIX • Matrix calculations","Matrix input uses [[row1],[row2]]. Supports determinant, inverse, transpose, trace, rank and multiplication.",inp("matA","Matrix A","[[1,2],[3,4]]")+inp("matB","Matrix B","[[2,0],[1,2]]"),btn("matDet","det A")+btn("matInv","A⁻¹")+btn("matTrans","Transpose")+btn("matTrace","Trace")+btn("matRank","Rank")+btn("matMul","A × B")),
 VECTOR:()=>panelHTML("VECTOR • Vector calculations","Enter vectors as [x,y,z]. Supports dot product, cross product, magnitude and angle.",inp("vecA","Vector A","[1,2,3]")+inp("vecB","Vector B","[4,5,6]"),btn("vecDot","A · B")+btn("vecCross","A × B")+btn("vecMag","|A|")+btn("vecAngle","Angle")),
 BASE:()=>panelHTML("BASE-N • Number systems","Convert integers between binary, octal, decimal and hexadecimal. Bitwise AND, OR and XOR are available.",inp("baseNum","Integer","255")+`<select id="baseFrom"><option value="10">Decimal</option><option value="2">Binary</option><option value="8">Octal</option><option value="16">Hexadecimal</option></select>`,btn("baseRun","Convert")+btn("baseAnd","AND")+btn("baseOr","OR")+btn("baseXor","XOR")),
 EQN:()=>panelHTML("EQN • Equation solver","Solve linear systems (2 or 3 unknowns) and polynomial equations up to degree 4 (numerical roots).",inp("poly","Coefficients a,b,c,d,e","1,-6,11,-6,0")+inp("linearA","Linear matrix A","[[2,1],[1,-1]]")+inp("linearB","Constants B","[5,1]"),btn("polyRun","Polynomial roots")+btn("linearRun","Solve linear system")),
 CALC:()=>panelHTML("CALC • Numerical calculus","Approximate derivative at a point and definite integral using Simpson’s rule.",inp("calcFn","f(x)","x^3")+inp("calcAt","x / lower bound","2")+inp("calcTo","Upper bound","4"),btn("diffRun","Derivative")+btn("integralRun","Integral")),
 PROB:()=>panelHTML("PROB • Probability and number theory","Binomial probability, normal CDF, permutations, combinations, random integers, prime factorisation, gcd and lcm.",inp("probN","n","10")+inp("probR","r","3")+inp("probP","p (0–1)","0.5"),btn("binomRun","Binomial P(X=r)")+btn("ncrRun","nCr / nPr")+btn("primeRun","Prime factors")+btn("gcdRun","GCD / LCM")+btn("normalRun","Normal CDF")+btn("randRun","Random integer")),
 CONVERT:()=>panelHTML("CONVERT • Units and constants","Convert common length, mass, time, area, volume, speed, pressure, energy and temperature units. Constants are available by name.",inp("convValue","Value","1")+inp("convFrom","From unit","km")+inp("convTo","To unit","mile"),btn("convertRun","Convert")+btn("constantsRun","Show constants"))
 };
 panel.innerHTML=configs[mode]();wireMode();display();
}
function output(t){$("#modeOutput").textContent=typeof t==="string"?t:JSON.stringify(t)}
function read(id){return $("#"+id)?.value??""}
function wireMode(){
 const on=(id,fn)=>$("#"+id)?.addEventListener("click",()=>{try{output(fn())}catch(e){output("ERROR: "+e.message)}});
 on("complexRun",()=>evaluate(read("complexExpr")));
 on("statRun",()=>{let x=read("statX").split(",").map(Number);if(!x.length||x.some(Number.isNaN))throw Error("Invalid x data");let mean=x.reduce((a,b)=>a+b,0)/x.length,sorted=[...x].sort((a,b)=>a-b),median=sorted.length%2?sorted[(sorted.length-1)/2]:(sorted[sorted.length/2-1]+sorted[sorted.length/2])/2,variance=x.reduce((s,v)=>s+(v-mean)**2,0);let res={n:x.length,sum:x.reduce((a,b)=>a+b,0),mean,median,min:Math.min(...x),max:Math.max(...x),populationSD:Math.sqrt(variance/x.length),sampleSD:x.length>1?Math.sqrt(variance/(x.length-1)):null};let ys=read("statY").trim();if(ys){let y=ys.split(",").map(Number);if(y.length!==x.length||y.some(Number.isNaN))throw Error("x and y need equal numeric lengths");let mx=mean,my=y.reduce((a,b)=>a+b,0)/y.length,Sxx=x.reduce((s,v)=>s+(v-mx)**2,0),Sxy=x.reduce((s,v,i)=>s+(v-mx)*(y[i]-my),0),slope=Sxy/Sxx,intercept=my-slope*mx;res.regression={slope,intercept,r:Sxy/Math.sqrt(Sxx*y.reduce((s,v)=>s+(v-my)**2,0))}}return res});
 on("tableRun",()=>{let f=read("fn"),a=+read("tStart"),b=+read("tEnd"),d=+read("tStep");if(!d||Math.abs((b-a)/d)>100)throw Error("Invalid step or more than 101 rows");let rows=[];for(let x=a;d>0?x<=b+1e-10:x>=b-1e-10;x+=d)rows.push(`x=${x}  f(x)=${evaluate(f,{x})}`);return rows.join("\n")});
 const A=()=>math.evaluate(read("matA")),B=()=>math.evaluate(read("matB"));
 on("matDet",()=>math.det(A()));on("matInv",()=>math.inv(A()).toString());on("matTrans",()=>math.transpose(A()).toString());on("matTrace",()=>math.trace(A()));on("matRank",()=>math.rank(A()));on("matMul",()=>math.multiply(A(),B()).toString());
 const va=()=>math.evaluate(read("vecA")),vb=()=>math.evaluate(read("vecB"));
 on("vecDot",()=>math.dot(va(),vb()));on("vecCross",()=>math.cross(va(),vb()).toString());on("vecMag",()=>math.norm(va()));on("vecAngle",()=>{let c=math.dot(va(),vb())/(math.norm(va())*math.norm(vb()));return (angle==="DEG"?Math.acos(c)*180/Math.PI:Math.acos(c))});
 on("baseRun",()=>{let n=parseInt(read("baseNum"),+read("baseFrom"));if(Number.isNaN(n))throw Error("Invalid integer");return `BIN ${n.toString(2)} | OCT ${n.toString(8)} | DEC ${n} | HEX ${n.toString(16).toUpperCase()}`});
 const bit=(op)=>{let n=parseInt(read("baseNum"),+read("baseFrom")),m=parseInt(prompt("Enter second integer")||"0");return op(n,m)};on("baseAnd",()=>bit((a,b)=>a&b));on("baseOr",()=>bit((a,b)=>a|b));on("baseXor",()=>bit((a,b)=>a^b));
 on("polyRun",()=>{let c=read("poly").split(",").map(Number);if(c.length<2||c.some(Number.isNaN))throw Error("Enter coefficients highest degree first");return polynomialRoots(c)});
 on("linearRun",()=>math.lusolve(math.evaluate(read("linearA")),math.evaluate(read("linearB"))).toString());
 on("diffRun",()=>{let f=read("calcFn"),x=+read("calcAt"),h=1e-5;return (evaluate(f,{x:x+h})-evaluate(f,{x:x-h}))/(2*h)});
 on("integralRun",()=>{let f=read("calcFn"),a=+read("calcAt"),b=+read("calcTo"),n=10000;if(a===b)return 0;let h=(b-a)/n,s=evaluate(f,{x:a})+evaluate(f,{x:b});for(let i=1;i<n;i++)s+=(i%2?4:2)*evaluate(f,{x:a+i*h});return s*h/3});
 on("binomRun",()=>{let n=+read("probN"),r=+read("probR"),p=+read("probP");if(p<0||p>1||r<0||r>n)throw Error("Require 0≤r≤n and 0≤p≤1");return choose(n,r)*p**r*(1-p)**(n-r)});
 on("ncrRun",()=>({nCr:choose(+read("probN"),+read("probR")),nPr:choose(+read("probN"),+read("probR"))*factorial(+read("probR"))}));
 on("primeRun",()=>primeFactors(+read("probN")).join(" × "));
 on("gcdRun",()=>({gcd:gcd(+read("probN"),+read("probR")),lcm:Math.abs(+read("probN")*+read("probR"))/gcd(+read("probN"),+read("probR"))}));
 on("normalRun",()=>{let z=+read("probN");return .5*(1+erf(z/Math.sqrt(2)))});
 on("randRun",()=>Math.floor(Math.random()*(Math.max(+read("probN"),+read("probR"))-Math.min(+read("probN"),+read("probR"))+1))+Math.min(+read("probN"),+read("probR")));
 on("convertRun",()=>{let v=+read("convValue"),from=read("convFrom"),to=read("convTo");return math.unit(v,from).to(to).toString()});
 on("constantsRun",()=>"c = 299792458 m/s\nG = 6.67430e-11 m³ kg⁻¹ s⁻²\nh = 6.62607015e-34 J·s\nkB = 1.380649e-23 J/K\nNA = 6.02214076e23 mol⁻¹\ne = 1.602176634e-19 C\nme = 9.1093837e-31 kg\nmp = 1.6726219e-27 kg\nR = 8.314462618 J mol⁻¹ K⁻¹");
}
function polynomialRoots(c){while(c.length>1&&c[0]===0)c.shift();let n=c.length-1;if(n<1||n>4)throw Error("Supported polynomial degree: 1 to 4");if(n===1)return [-c[1]/c[0]];if(n===2){let [a,b,d]=c,disc=b*b-4*a*d;if(disc>=0)return [(-b+Math.sqrt(disc))/(2*a),(-b-Math.sqrt(disc))/(2*a)];let re=-b/(2*a),im=Math.sqrt(-disc)/(2*a);return [`${re}+${im}i`,`${re}-${im}i`]}
 // Durand–Kerner complex iteration
 let coeff=c.map(x=>math.complex(x,0)),roots=Array.from({length:n},(_,k)=>math.multiply(math.exp(math.complex(0,2*Math.PI*k/n)),1.1));
 const peval=z=>coeff.reduce((acc,a)=>math.add(math.multiply(acc,z),a),math.complex(0,0));
 for(let iter=0;iter<250;iter++){let max=0;roots=roots.map((z,i)=>{let den=math.complex(1,0);roots.forEach((w,j)=>{if(i!==j)den=math.multiply(den,math.subtract(z,w))});let delta=math.divide(peval(z),den);max=Math.max(max,math.abs(delta));return math.subtract(z,delta)});if(max<1e-10)break}
 return roots.map(z=>Math.abs(z.im)<1e-8?Number(z.re.toFixed(9)):z.toString());
}
$$(".keypad button").forEach(b=>b.onclick=()=>{if(!powered)return;if(b.dataset.a==="equals")calculate();else if(b.dataset.a==="del"){expr=expr.slice(0,-1);out("#lcdExpr",expr||"0")}else add(b.dataset.v)});
$$(".modes button").forEach(b=>b.onclick=()=>{mode=b.dataset.mode;$$(".modes button").forEach(x=>x.classList.toggle("selected",x===b));renderMode()});
$("#power").onclick=()=>{powered=!powered;document.body.classList.toggle("off",!powered);$("#power").textContent=powered?"OFF":"ON";if(powered){status("Power on");display()}else{expr="";out("#lcdExpr","");out("#lcdResult","");out("#lcdStatus","")}};
$("#angle").onclick=()=>{angle=angle==="DEG"?"RAD":angle==="RAD"?"GRA":"DEG";out("#angleTag",angle);status("Angle unit: "+angle)};
$("#shift").onclick=()=>{shift=!shift;status(shift?"SHIFT active":"SHIFT off")};$("#alpha").onclick=()=>{alpha=!alpha;status(alpha?"ALPHA active":"ALPHA off")};
$("#memory").onclick=()=>{try{memory=Number(ans);status("Stored in memory: "+memory)}catch(e){status("Memory error")}};
$("#historyToggle").onclick=()=>$("#historyPanel").classList.toggle("hidden");
$("#clearHistory").onclick=()=>{history=[];localStorage.removeItem("cw_history");renderHistory()};
document.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();calculate()}else if(e.key==="Escape")clear();else if(e.key==="Backspace"){expr=expr.slice(0,-1);out("#lcdExpr",expr||"0")}else if(/^[0-9.+\-*/()^!]$/.test(e.key))add(e.key)});
renderHistory();renderMode();display();
