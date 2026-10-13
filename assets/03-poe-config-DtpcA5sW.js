var e={id:`poe-config`,h:{en:`Configuring PoE: allocation, priority, guard band and verification`,hi:`PoE configure karna: allocation, priority, guard band aur verification`},body:{en:`
<p>PoE on an EX switch is configured under <code>poe</code>. Four decisions matter: which ports supply power, how power is <b>reserved</b> (static or class), which ports win when the budget runs short (<b>priority</b>), and how much to hold back (<b>guard band</b>).</p>

<h3>The statements</h3>
<pre class="code">set poe interface all                          <span class="c">! PoE on every PoE-capable port</span>
set poe interface ge-0/0/12 disable             <span class="c">! switch PoE off for one port</span>
set poe interface ge-0/0/5 priority high        <span class="c">! served first when the budget is short</span>
set poe interface ge-0/0/9 maximum-power 7      <span class="c">! cap one port at 7 W (watts)</span>
set poe management class                        <span class="c">! reserve by device class instead of maximum-power</span>
set poe guard-band 10                           <span class="c">! watts kept free</span></pre>
<table class="cmp"><tr><th>Setting</th><th>Default</th><th>Effect</th></tr>
<tr><td><code>management</code></td><td>static</td><td>static: each powered port reserves its <code>maximum-power</code> (15.4 W default); class: reserve the class maximum</td></tr>
<tr><td><code>maximum-power</code></td><td>15.4 W</td><td>per-port ceiling; in static mode also the reservation</td></tr>
<tr><td><code>priority</code></td><td>low</td><td>high-priority ports are served first</td></tr>
<tr><td><code>guard-band</code></td><td>0 W</td><td>watts withheld from the budget as a safety margin</td></tr></table>

<h3>Real output: static allocation, Lab 1 (124 W switch)</h3>
<pre class="out">lab@ACC1&gt; show poe controller
Controller  Maximum   Power         Guard    Management   Status
index       power     consumption   band
0           124.0W    10.8W         0W       <span class="hl">Static</span>       UP
Allocated power: <span class="hl">30.8W of 124.0W</span> available (static allocation: maximum-power of each powered port)

lab@ACC1&gt; show poe interface
Interface    Admin       Oper        Max        Priority       Power          Class
             status      status      power                     consumption
ge-0/0/0     Enabled     Searching   15.4W      Low            0.0W           not-applicable
ge-0/0/1     Enabled     ON          15.4W      Low            5.4W           2
ge-0/0/2     Enabled     ON          15.4W      Low            5.4W           2
ge-0/0/3     Enabled     Searching   15.4W      Low            0.0W           not-applicable</pre>
<p>Read it: two phones are ON, each class 2, each really consuming 5.4 W (total 10.8 W). But <b>30.8 W is allocated</b> (2 x 15.4 W) because static management reserves the port maximum. On a 124 W switch this is harmless: 93.2 W remain. Ports with nothing attached say <b>Searching</b>.</p>

<h3>Real output: a 32 W switch, before the fix (Lab 2)</h3>
<pre class="out">lab@ACC2&gt; show poe controller
Controller  Maximum   Power         Guard    Management   Status
index       power     consumption   band
0           32.0W     10.8W         0W       Static       UP
Allocated power: <span class="hl">30.8W of 32.0W</span> available (static allocation: maximum-power of each powered port)

lab@ACC2&gt; show poe interface
ge-0/0/1     Enabled     ON          15.4W      Low            5.4W           2
ge-0/0/2     Enabled     ON          15.4W      Low            5.4W           2
ge-0/0/5     Enabled     <span class="hl">OFF</span>         15.4W      Low            0.0W           not-applicable</pre>
<p>Two phones hold 30.8 W of the 32 W. The third phone, the reception phone on ge-0/0/5, would need another 15.4 W and cannot start: <b>OFF</b>. Actual consumption is only 10.8 W, yet the budget is full on paper.</p>

<h3>The fix: class management and priority</h3>
<pre class="code">set poe management class
set poe interface ge-0/0/5 priority high</pre>
<pre class="out">lab@ACC2&gt; show poe controller
Controller  Maximum   Power         Guard    Management   Status
index       power     consumption   band
0           32.0W     16.2W         0W       <span class="hl">Class</span>        UP
Allocated power: <span class="hl">21.0W of 32.0W</span> available (class-based allocation)

lab@ACC2&gt; show poe interface
ge-0/0/1     Enabled     ON          15.4W      Low            5.4W           2
ge-0/0/2     Enabled     ON          15.4W      Low            5.4W           2
ge-0/0/5     Enabled     ON          15.4W      <span class="hl">High</span>           5.4W           2</pre>
<p>Now three class-2 phones reserve 7 W each = 21 W of 32 W. Real consumption is 16.2 W (3 x 5.4). The reception phone is ON and has <b>High</b> priority, so it will survive any future shortage.</p>

<h3>What happens when the budget runs out?</h3>
<p>The switch serves <b>high-priority</b> ports first. Within the same priority, lower port numbers are served first. A port that cannot be served is left unpowered; it is not shared. Plan priorities for the devices that must never fail (reception, emergency lines, security phones) and give them <code>priority high</code>. A <b>guard band</b> reduces the usable budget by the configured watts so that a sudden consumption increase does not trip the whole PSE.</p>

<h3>Choosing the allocation method</h3>
<table class="cmp"><tr><th>Method</th><th>Pros</th><th>Cons</th></tr>
<tr><td>static (default)</td><td>predictable; every port may use up to its maximum</td><td>wastes budget; small switches fill up fast</td></tr>
<tr><td>class</td><td>efficient with phones of known class</td><td>device that draws more than its class may be cut off</td></tr></table>
<p>A third approach, <code>maximum-power</code> per port, lets you cap special ports (for example 7 W on ports that only host basic phones) and gives you control in static mode.</p>

<h3>Order of verification</h3>
<ol>
<li><code>show poe controller</code>: budget, allocated, management mode.</li>
<li><code>show poe interface</code>: Oper (ON, OFF, Searching), class, priority.</li>
<li>If Searching: cable or device. If OFF: budget or disabled port.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Reading "Power consumption" as the reservation. Forgetting that moving to class mode needs devices that classify correctly. Setting <code>priority high</code> on every port, which makes priority meaningless. Using a large guard band on a small switch.</p></div>
<div class="exam"><p><b>Exam trap.</b> In static mode each powered port reserves its <b>maximum-power</b> (15.4 W by default), not what the phone draws. In class mode the reservation is the class value: 7 W for class 2. A 30 W budget therefore fits one phone (static) or four (class, 4 x 7 = 28 W).</p></div>

<div class="scn"><h4>The reception phone that always died first</h4><p>The reception phone sat on the highest port number of a full switch. Every time a new phone was plugged in, reception lost power, because the switch served lower-numbered ports first. The team gave the reception port priority high and moved the switch to class-based allocation. New phones could join later without cutting any critical line.</p><p><b>Lesson:</b> priority is the answer to "who loses when we run out".</p></div>

<div class="iv"><p class="q">"A 32 W switch cannot power its third phone. What do you do?"</p><p>First check <code>show poe controller</code> and see static allocation reserving 15.4 W per port, so two phones fill 30.8 W of 32 W. I switch to <code>poe management class</code> so a class-2 phone reserves 7 W, raise the priority of critical ports, and check the guard band. If the budget is still short, I need a bigger PoE budget or an injector, not a software trick.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Static reserves the port maximum (15.4 W); class reserves the class value (class 2 = 7 W).</li>
<li><code>show poe controller</code> shows allocated against budget; <code>show poe interface</code> shows per-port state.</li>
<li>Priority high keeps critical phones powered when the budget is short.</li>
<li>Guard band reserves a safety margin; maximum-power caps a port.</li>
<li>Real consumption is usually lower than the reservation.</li>
</ul></div>
`,hi:`
<p>EX switch par PoE <code>poe</code> ke neeche configure hota hai. Chaar faisle zaroori hain: kaunse ports power dein, power kaise <b>reserve</b> hoti hai (static ya class), budget kam padne par kaunse ports jeetein (<b>priority</b>), aur kitna rok kar rakhna hai (<b>guard band</b>).</p>

<h3>Statements</h3>
<pre class="code">set poe interface all                          <span class="c">! har PoE-capable port par PoE</span>
set poe interface ge-0/0/12 disable             <span class="c">! ek port ke liye PoE band</span>
set poe interface ge-0/0/5 priority high        <span class="c">! budget kam ho to pehle serve hota hai</span>
set poe interface ge-0/0/9 maximum-power 7      <span class="c">! ek port ko 7 W (watts) par cap</span>
set poe management class                        <span class="c">! maximum-power ki jagah device class se reserve</span>
set poe guard-band 10                           <span class="c">! itne watts khaali</span></pre>
<table class="cmp"><tr><th>Setting</th><th>Default</th><th>Asar</th></tr>
<tr><td><code>management</code></td><td>static</td><td>static: har powered port apna <code>maximum-power</code> (default 15.4 W) reserve karta hai; class: class maximum reserve</td></tr>
<tr><td><code>maximum-power</code></td><td>15.4 W</td><td>per-port ceiling; static mode mein reservation bhi</td></tr>
<tr><td><code>priority</code></td><td>low</td><td>high-priority ports pehle serve hote hain</td></tr>
<tr><td><code>guard-band</code></td><td>0 W</td><td>safety margin ke roop mein budget se rokte watts</td></tr></table>

<h3>Asli output: static allocation, Lab 1 (124 W switch)</h3>
<pre class="out">lab@ACC1&gt; show poe controller
Controller  Maximum   Power         Guard    Management   Status
index       power     consumption   band
0           124.0W    10.8W         0W       <span class="hl">Static</span>       UP
Allocated power: <span class="hl">30.8W of 124.0W</span> available (static allocation: maximum-power of each powered port)

lab@ACC1&gt; show poe interface
Interface    Admin       Oper        Max        Priority       Power          Class
             status      status      power                     consumption
ge-0/0/0     Enabled     Searching   15.4W      Low            0.0W           not-applicable
ge-0/0/1     Enabled     ON          15.4W      Low            5.4W           2
ge-0/0/2     Enabled     ON          15.4W      Low            5.4W           2
ge-0/0/3     Enabled     Searching   15.4W      Low            0.0W           not-applicable</pre>
<p>Padho: do phones ON hain, har ek class 2, har ek asal mein 5.4 W le raha hai (total 10.8 W). Par <b>30.8 W allocated</b> hai (2 x 15.4 W) kyunki static management port maximum reserve karta hai. 124 W switch par yeh nuksan nahi: 93.2 W bachte hain. Jin ports par kuch nahi lagta woh <b>Searching</b> dikhate hain.</p>

<h3>Asli output: 32 W switch, fix se pehle (Lab 2)</h3>
<pre class="out">lab@ACC2&gt; show poe controller
Controller  Maximum   Power         Guard    Management   Status
index       power     consumption   band
0           32.0W     10.8W         0W       Static       UP
Allocated power: <span class="hl">30.8W of 32.0W</span> available (static allocation: maximum-power of each powered port)

lab@ACC2&gt; show poe interface
ge-0/0/1     Enabled     ON          15.4W      Low            5.4W           2
ge-0/0/2     Enabled     ON          15.4W      Low            5.4W           2
ge-0/0/5     Enabled     <span class="hl">OFF</span>         15.4W      Low            0.0W           not-applicable</pre>
<p>Do phones 32 W mein se 30.8 W pakde hue hain. Teesre phone, ge-0/0/5 ke reception phone, ko 15.4 W aur chahiye aur woh start nahi ho sakta: <b>OFF</b>. Asal consumption sirf 10.8 W hai, phir bhi budget kaagaz par bhara hua hai.</p>

<h3>Fix: class management aur priority</h3>
<pre class="code">set poe management class
set poe interface ge-0/0/5 priority high</pre>
<pre class="out">lab@ACC2&gt; show poe controller
Controller  Maximum   Power         Guard    Management   Status
index       power     consumption   band
0           32.0W     16.2W         0W       <span class="hl">Class</span>        UP
Allocated power: <span class="hl">21.0W of 32.0W</span> available (class-based allocation)

lab@ACC2&gt; show poe interface
ge-0/0/1     Enabled     ON          15.4W      Low            5.4W           2
ge-0/0/2     Enabled     ON          15.4W      Low            5.4W           2
ge-0/0/5     Enabled     ON          15.4W      <span class="hl">High</span>           5.4W           2</pre>
<p>Ab teen class-2 phones 7 W har ek = 32 W mein se 21 W reserve karte hain. Asal consumption 16.2 W (3 x 5.4). Reception phone ON hai aur uski priority <b>High</b> hai, isliye aage kisi kami mein bhi bachega.</p>

<h3>Budget khatam ho jaaye to kya hota hai?</h3>
<p>Switch <b>high-priority</b> ports ko pehle serve karta hai. Same priority mein chhote port numbers pehle. Jo port serve nahi ho sakta woh unpowered rehta hai; power baanti nahi jaati. Jin devices ko kabhi fail nahi hona (reception, emergency lines, security phones) unhe <code>priority high</code> do. <b>Guard band</b> usable budget ko configured watts se kam kar deta hai taaki achanak consumption badhne se poora PSE trip na ho.</p>

<h3>Allocation method chunna</h3>
<table class="cmp"><tr><th>Method</th><th>Faayde</th><th>Nuksan</th></tr>
<tr><td>static (default)</td><td>predictable; har port apne maximum tak use kar sakta hai</td><td>budget waste; chhote switches jaldi bharte hain</td></tr>
<tr><td>class</td><td>known class ke phones ke saath efficient</td><td>apni class se zyada khinchne wala device cut ho sakta hai</td></tr></table>
<p>Teesra tareeka port par <code>maximum-power</code> hai, jisse special ports cap kar sakte ho (jaise sirf basic phones wale ports par 7 W) aur static mode mein control milta hai.</p>

<h3>Verification ka order</h3>
<ol>
<li><code>show poe controller</code>: budget, allocated, management mode.</li>
<li><code>show poe interface</code>: Oper (ON, OFF, Searching), class, priority.</li>
<li>Searching ho to: cable ya device. OFF ho to: budget ya disabled port.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> "Power consumption" ko reservation samajhna. Yeh bhoolna ki class mode ke liye devices ka sahi classify karna zaroori hai. Har port par <code>priority high</code> lagana, jisse priority ka matlab hi nahi rehta. Chhote switch par bada guard band.</p></div>
<div class="exam"><p><b>Exam trap.</b> Static mode mein har powered port apna <b>maximum-power</b> (default 15.4 W) reserve karta hai, phone jitna khinchta hai utna nahi. Class mode mein reservation class value hai: class 2 ke liye 7 W. 30 W budget isliye ek phone (static) ya chaar (class, 4 x 7 = 28 W) fit karta hai.</p></div>

<div class="scn"><h4>Reception phone jo hamesha pehle marta tha</h4><p>Reception phone full switch ke sabse bade port number par tha. Jab bhi naya phone lagta, reception ki power chali jaati, kyunki switch chhote port numbers ko pehle serve karta tha. Team ne reception port ko priority high di aur switch ko class-based allocation par kiya. Naye phones baad mein judne par bhi koi critical line nahi kati.</p><p><b>Lesson:</b> priority "budget khatam hone par kaun haarega" ka jawab hai.</p></div>

<div class="iv"><p class="q">"32 W switch teesre phone ko power nahi de pa raha. Kya karoge?"</p><p>Pehle <code>show poe controller</code> dekhta hoon aur static allocation har port par 15.4 W reserve karta dikhta hai, isliye do phones 32 W mein se 30.8 W bhar dete hain. Main <code>poe management class</code> par jaata hoon taaki class-2 phone 7 W reserve kare, critical ports ki priority badhata hoon, aur guard band check karta hoon. Budget phir bhi kam ho to bada PoE budget ya injector chahiye, software trick nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Static port maximum (15.4 W) reserve karta hai; class, class value (class 2 = 7 W).</li>
<li><code>show poe controller</code> allocated vs budget dikhata hai; <code>show poe interface</code> per-port state.</li>
<li>Priority high budget kam hone par critical phones ko powered rakhti hai.</li>
<li>Guard band safety margin reserve karta hai; maximum-power port cap karta hai.</li>
<li>Asal consumption aam taur par reservation se kam hoti hai.</li>
</ul></div>
`}};export{e as default};