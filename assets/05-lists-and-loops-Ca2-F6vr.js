var e={id:`lists-and-loops`,h:{en:`Lists and loops: one idea, many routers`,hi:`Lists aur loops: ek idea, kai routers`},body:{en:`
<p>The whole power of automation is one idea: <b>do the same thing for every item in a list</b>. On a switch you already know a version of it. The command <code>interface range gigabitEthernet 0/1 - 4</code> applies the same commands to four ports. In Python the list is the range and the <b>for loop</b> is the "apply to each".</p>
<h3>A list in detail</h3>
<p>A list keeps its items in order. Each item has a position number called an <b>index</b>, and Python starts counting at <b>0</b>, like <code>Gi0/0</code> being the first port. <code>len()</code> tells you how many items there are.</p>
<pre class="code">routers = ["10.99.0.1", "10.99.0.2", "10.99.0.3"]
count = 0
for ip in routers:
    print("Visiting", ip)
    count = count + 1
print("Visited", count, "routers")
print("The list has", len(routers), "items")
print("First item:", routers[0])</pre>
<pre class="out">AUTO&gt; python3 loop_demo.py
Visiting 10.99.0.1
Visiting 10.99.0.2
Visiting 10.99.0.3
<span class="hl">Visited 3 routers</span>
The list has 3 items
First item: 10.99.0.1</pre>
<ul>
<li><code>count = 0</code> creates a <b>counter</b> that starts at zero.</li>
<li><code>count = count + 1</code> reads "take the current value, add 1, store it back". It runs once per router, so after three routers the counter is 3.</li>
<li><code>routers[0]</code> is the first item. The line <code>print("Visited", ...)</code> is not indented, so it runs once, after the loop ends.</li>
</ul>
<p>You can also loop over numbers with <code>range()</code>. <code>range(1, 4)</code> gives 1, 2, 3: the end number is <b>not</b> included. This is handy for building repeated config lines:</p>
<pre class="code">for n in range(1, 4):
    print("interface Loopback" + str(n))</pre>
<pre class="out">AUTO&gt; python3 loop_demo2.py
interface Loopback1
interface Loopback2
interface Loopback3</pre>
<p><code>str(n)</code> turns the number into text so it can be joined to other text with <code>+</code>. Chapter-wise Python lessons cover this in the next module.</p>
<h3>Teaching the script about a third router</h3>
<p>In Lab 1 a new router arrives at 10.99.0.3. You change one line, the list, and nothing else. Line 8 before the change:</p>
<pre class="out">ROUTERS = ["10.99.0.1", "10.99.0.2"]</pre>
<pre class="out">AUTO&gt; sed -i 's/"10.99.0.2"/"10.99.0.2", "10.99.0.3"/' first_script.py</pre>
<pre class="out">AUTO&gt; nl first_script.py   (line 8 only)
     8  ROUTERS = ["10.99.0.1", "10.99.0.2", "10.99.0.3"]</pre>
<pre class="out">AUTO&gt; python3 first_script.py
Connecting to 10.99.0.1
  Hostname: PUN-CORE-01
  PUN-CORE-01 uptime is 0 minutes
Connecting to 10.99.0.2
  Hostname: BLR-EDGE-02
  BLR-EDGE-02 uptime is 0 minutes
Connecting to 10.99.0.3
<span class="hl">  Hostname: HYD-EDGE-03</span>
<span class="hl">  HYD-EDGE-03 uptime is 0 minutes</span>
<span class="hl">Done: 3 routers checked</span></pre>
<p>The loop visited one more router, and the counter at the end, <code>len(ROUTERS)</code>, now says 3. You did not copy-paste any login code. That is the magic of lists and loops.</p>
<div class="eg"><p><b>Worked example.</b> Lab 1 question: "What is the hostname of the new router (10.99.0.3)?" The second run prints <code>Hostname: HYD-EDGE-03</code> under <code>Connecting to 10.99.0.3</code>. Add an IP to the list, and the script reports one more device.</p></div>
<div class="warn"><p><b>Common mistake.</b> Putting a line at the wrong indentation. If <code>print("Visited", ...)</code> were indented, it would run inside the loop and print three times. Also, forgetting a comma between two IPs in the list joins them into one wrong string.</p></div>
<div class="exam"><p><b>Exam trap.</b> Indexes start at 0. <code>range(1, 4)</code> excludes 4. <code>len(list)</code> counts items. Expect questions that ask what a short loop prints.</p></div>
<div class="scn"><h4>Forty routers, one list</h4><p>A team kept router IPs in a text note and copied them into a script's list. When two sites merged, they added eleven IPs to the list and re-ran the same script. The next report included all 51 devices, and nobody wrote new login code.</p><p><b>Lesson:</b> data (the list) and logic (the loop) are separate, so growth is a one-line change.</p></div>
<div class="iv"><p class="q">"What is a for loop and why is it central to automation?"</p><p>A for loop repeats a block of code once for each item in a sequence such as a list of device IPs. It lets one piece of code handle ten or a thousand devices. Mention indentation, the colon, and that the loop variable takes each value in turn.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A list holds many values in order; indexes start at 0.</li>
<li>A for loop runs its indented lines once per item.</li>
<li>A counter starts at 0 and adds 1 inside the loop.</li>
<li>To add a device, add one IP to the list.</li>
</ul></div>
`,hi:`
<p>Automation ki poori taakat ek idea mein hai: <b>list ke har item ke liye wahi kaam karo</b>. Switch par aap iska ek version jaante ho. <code>interface range gigabitEthernet 0/1 - 4</code> command chaar ports par same commands lagata hai. Python mein list woh range hai aur <b>for loop</b> "har ek par lagao" hai.</p>
<h3>List detail mein</h3>
<p>List apne items ko order mein rakhti hai. Har item ka ek position number hota hai jise <b>index</b> kehte hain, aur Python <b>0</b> se ginna shuru karta hai, jaise <code>Gi0/0</code> pehla port hota hai. <code>len()</code> batata hai kitne items hain.</p>
<pre class="code">routers = ["10.99.0.1", "10.99.0.2", "10.99.0.3"]
count = 0
for ip in routers:
    print("Visiting", ip)
    count = count + 1
print("Visited", count, "routers")
print("The list has", len(routers), "items")
print("First item:", routers[0])</pre>
<pre class="out">AUTO&gt; python3 loop_demo.py
Visiting 10.99.0.1
Visiting 10.99.0.2
Visiting 10.99.0.3
<span class="hl">Visited 3 routers</span>
The list has 3 items
First item: 10.99.0.1</pre>
<ul>
<li><code>count = 0</code> ek <b>counter</b> banata hai jo zero se shuru hota hai.</li>
<li><code>count = count + 1</code> ka matlab "current value lo, 1 jodo, wapas store karo". Yeh har router ke liye ek baar chalta hai, isliye teen routers ke baad counter 3 hota hai.</li>
<li><code>routers[0]</code> pehla item hai. <code>print("Visited", ...)</code> wali line indented nahi hai, isliye woh loop khatam hone ke baad ek baar chalti hai.</li>
</ul>
<p>Aap numbers par bhi <code>range()</code> se loop chala sakte ho. <code>range(1, 4)</code> 1, 2, 3 deta hai: end number shaamil <b>nahi</b> hota. Repeated config lines banane ke liye yeh kaam ka hai:</p>
<pre class="code">for n in range(1, 4):
    print("interface Loopback" + str(n))</pre>
<pre class="out">AUTO&gt; python3 loop_demo2.py
interface Loopback1
interface Loopback2
interface Loopback3</pre>
<p><code>str(n)</code> number ko text bana deta hai taaki use doosre text se <code>+</code> se joda ja sake. Iske baare mein agle module mein detail se padhoge.</p>
<h3>Script ko teesre router ke baare mein sikhana</h3>
<p>Lab 1 mein 10.99.0.3 par naya router aata hai. Aap sirf ek line badalte ho, list, aur kuch nahi. Badlav se pehle line 8:</p>
<pre class="out">ROUTERS = ["10.99.0.1", "10.99.0.2"]</pre>
<pre class="out">AUTO&gt; sed -i 's/"10.99.0.2"/"10.99.0.2", "10.99.0.3"/' first_script.py</pre>
<pre class="out">AUTO&gt; nl first_script.py   (line 8 only)
     8  ROUTERS = ["10.99.0.1", "10.99.0.2", "10.99.0.3"]</pre>
<pre class="out">AUTO&gt; python3 first_script.py
Connecting to 10.99.0.1
  Hostname: PUN-CORE-01
  PUN-CORE-01 uptime is 0 minutes
Connecting to 10.99.0.2
  Hostname: BLR-EDGE-02
  BLR-EDGE-02 uptime is 0 minutes
Connecting to 10.99.0.3
<span class="hl">  Hostname: HYD-EDGE-03</span>
<span class="hl">  HYD-EDGE-03 uptime is 0 minutes</span>
<span class="hl">Done: 3 routers checked</span></pre>
<p>Loop ne ek aur router visit kiya, aur end ka counter, <code>len(ROUTERS)</code>, ab 3 dikhata hai. Aapne login code copy-paste nahi kiya. Lists aur loops ka jaadu yahi hai.</p>
<div class="eg"><p><b>Worked example.</b> Lab 1 sawaal: "Naye router (10.99.0.3) ka hostname kya hai?" Doosra run <code>Connecting to 10.99.0.3</code> ke neeche <code>Hostname: HYD-EDGE-03</code> print karta hai. List mein ek IP jodo, aur script ek aur device ki report deta hai.</p></div>
<div class="warn"><p><b>Common galti.</b> Line ko galat indentation par rakhna. Agar <code>print("Visited", ...)</code> indented hoti, to woh loop ke andar chalti aur teen baar print hoti. Aur list mein do IPs ke beech comma bhool gaye to woh ek galat string mein jud jaate hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Index 0 se shuru hota hai. <code>range(1, 4)</code> mein 4 shaamil nahi. <code>len(list)</code> items gintta hai. Aise sawaal aate hain jo poochte hain ki chhota loop kya print karega.</p></div>
<div class="scn"><h4>Chalis routers, ek list</h4><p>Ek team router IPs ek text note mein rakhti thi aur unhe script ki list mein copy karti thi. Do sites merge hui to unhone list mein gyarah IPs jode aur wahi script dobara chalayi. Agli report mein saare 51 devices the, aur kisi ne naya login code nahi likha.</p><p><b>Lesson:</b> data (list) aur logic (loop) alag hain, isliye growth ek line ka change hai.</p></div>
<div class="iv"><p class="q">"for loop kya hai aur automation ke liye itna zaroori kyun hai?"</p><p>for loop code ke ek block ko sequence (jaise device IPs ki list) ke har item ke liye ek baar repeat karta hai. Isse code ka ek tukda das ya hazaar devices sambhal leta hai. Indentation, colon aur ye bolo ki loop variable baari-baari har value leta hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>List kai values order mein rakhti hai; index 0 se shuru.</li>
<li>for loop apni indented lines har item ke liye ek baar chalata hai.</li>
<li>Counter 0 se shuru hota hai aur loop ke andar 1 jodta hai.</li>
<li>Device jodne ke liye list mein ek IP jodo.</li>
</ul></div>
`}};export{e as default};