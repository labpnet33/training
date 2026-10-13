var e={id:`big-picture`,h:{en:`Scripts that log in for you: what you will learn and the big picture`,hi:`Jo script aapki jagah login kare: kya seekhoge aur big picture`},body:{en:`

<p><b>What you will learn in this module.</b> You will learn to make a small program log in to routers over SSH, read their output, change their configuration and prove that the change worked. You will use Python and a netmiko-style library called <code>nkmiko</code>. By the end you will back up three routers, push OSPF to them from one script, verify the result and read an error message without panic. These are the device-automation skills behind the CCNP Automation exam (350-901 AUTOCOR), and the same skills are reused in the Python for Network Engineers course.</p>
<p><b>Prerequisites.</b> You need to know what a router, an IP address and the CLI are. You do <b>not</b> need to know how to code. Every line of code in this module is explained, and each chapter teaches one small idea.</p>

<h3>Analogy: a very fast, very careful junior engineer</h3>
<p>Imagine you give a junior engineer a checklist: "log in to each router, run <code>show ip interface brief</code>, paste the answer into a file." The junior follows the list exactly, never gets bored and never mistypes. A <b>script</b> is that checklist, written in a language the computer understands. The computer is the junior: fast and obedient, but it does exactly what you wrote, not what you meant.</p>
<p>That is both the power and the danger. A script can fix 300 routers in a minute. A wrong script can also break 300 routers in a minute. So we build scripts in small safe steps, and we always check the result.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="The lab: one automation host (AUTO) reaches three routers over the management network 10.99.0.0/24."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="20" y="85" width="120" height="60" rx="10" fill="#ddd6fe"/><text x="80" y="112" text-anchor="middle" class="svg-ink" font-size="14">AUTO</text><text x="80" y="130" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.100</text><rect x="220" y="85" width="100" height="60" rx="10" fill="#e2e8f0"/><text x="270" y="112" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="270" y="130" text-anchor="middle" class="svg-muted" font-size="12">switch</text><rect x="440" y="10" width="140" height="56" rx="10" fill="#bae6fd"/><text x="510" y="35" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="510" y="53" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.1</text><rect x="440" y="87" width="140" height="56" rx="10" fill="#bae6fd"/><text x="510" y="112" text-anchor="middle" class="svg-ink" font-size="14">R2</text><text x="510" y="130" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.2</text><rect x="440" y="164" width="140" height="56" rx="10" fill="#bae6fd"/><text x="510" y="189" text-anchor="middle" class="svg-ink" font-size="14">R3</text><text x="510" y="207" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.3</text><line x1="140" y1="115" x2="220" y2="115" stroke="#64748b" stroke-width="2"/><line x1="320" y1="115" x2="380" y2="115" stroke="#64748b" stroke-width="2"/><line x1="380" y1="38" x2="380" y2="192" stroke="#64748b" stroke-width="2"/><line x1="380" y1="38" x2="440" y2="38" stroke="#64748b" stroke-width="2"/><line x1="380" y1="115" x2="440" y2="115" stroke="#64748b" stroke-width="2"/><line x1="380" y1="192" x2="440" y2="192" stroke="#64748b" stroke-width="2"/><text x="180" y="105" text-anchor="middle" class="svg-accent" font-size="12">SSH</text></svg><p class="cap">The lab: one automation host (AUTO) reaches three routers over the management network 10.99.0.0/24.</p></div>

<h3>The lab you will use</h3>
<p>The <b>AUTO</b> host is a small Linux-like computer with Python. Three routers R1, R2 and R3 sit on the management network 10.99.0.0/24. A <b>management network</b> is a network used only to administer devices. AUTO logs in to the routers using the username <code>netops</code> and the password <code>NK@2026</code>. These are lab values; in a real network a password never lives inside a script, and Chapter 9 shows what to do instead.</p>

<h3>The big idea: collect, change, verify</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Every network script is collect, change, verify. Verify is the step beginners skip."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="20" y="40" width="160" height="70" rx="10" fill="#fde68a"/><text x="100" y="72" text-anchor="middle" class="svg-ink" font-size="14">1. Collect</text><text x="100" y="90" text-anchor="middle" class="svg-muted" font-size="12">read show output</text><rect x="240" y="40" width="160" height="70" rx="10" fill="#bbf7d0"/><text x="320" y="72" text-anchor="middle" class="svg-ink" font-size="14">2. Change</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="12">send config lines</text><rect x="460" y="40" width="160" height="70" rx="10" fill="#ddd6fe"/><text x="540" y="72" text-anchor="middle" class="svg-ink" font-size="14">3. Verify</text><text x="540" y="90" text-anchor="middle" class="svg-muted" font-size="12">read again and check</text><line x1="180" y1="75" x2="240" y2="75" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="400" y1="75" x2="460" y2="75" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><path d="M540 110 Q540 140 320 140 Q100 140 100 110" fill="none" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/></svg><p class="cap">Every network script is collect, change, verify. Verify is the step beginners skip.</p></div>
<ol>
<li><b>Collect</b>: log in and read the current state, for example <code>show ip interface brief</code>.</li>
<li><b>Change</b>: send configuration lines, only when needed.</li>
<li><b>Verify</b>: read the state again and test that the change really worked: the neighbour is up, the interface has the address, the route exists.</li>
</ol>
<p>A script that prints "done" has only proved that it <i>sent</i> text. It has not proved that the network works.</p>

<h3>Your first five minutes on the AUTO host</h3>
<p>A <b>script</b> is a text file with the ending <code>.py</code>. You create and run it from the AUTO terminal using these small tools:</p>
<ul>
<li><code>ls</code> lists the files, <code>cat file.py</code> shows one, and <code>nl file.py</code> shows it with line numbers.</li>
<li><code>edit file.py 3 TEXT</code> replaces line 3 with TEXT. Spaces after the number are kept, which matters in Python.</li>
<li><code>write file.py</code> lets you type a whole file; finish by typing <code>EOF</code> on a line by itself.</li>
<li><code>python3 file.py</code> runs the script.</li>
</ul>
<p>Try the smallest script possible. It has two lines: <code>print()</code> is a <b>function</b> (a named action) that shows text on the screen.</p>
<pre class="code">print("Hello, network!")
print("2 + 3 =", 2 + 3)</pre>
<pre class="out">AUTO&gt; python3 hello.py
Hello, network!
2 + 3 = 5</pre>
<p>Python ran the file from top to bottom, one line at a time. The second line shows that Python can also calculate: <code>2 + 3</code> became <code>5</code>.</p>

<div class="eg"><p><b>Worked example.</b> Without a script: log in to R1, R2, R3, type <code>show ip interface brief</code> on each, copy three screens to a text file. About ten minutes of clicking and one chance in twenty of a slip. With a script: the same job is eight lines of code and takes two seconds, and it can be run again tomorrow, the same way. You will write exactly this script in Chapter 5.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking a script is magic or "smart". It is not. It sends exactly the text you wrote. If you wrote the wrong IP address, it will happily configure the wrong router.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exam may ask which step makes automation safe. The answer is verification (and testing before production), not speed. Also remember that SSH with a library such as netmiko automates the <i>CLI text</i>, while REST APIs (the next two modules) automate structured data.</p></div>

<div class="scn"><h4>The nightly backup that nobody did</h4><p>A retail company had 40 branch routers. The rule said "back up the configs every night", but it was a manual job and was skipped whenever people were busy. After a power failure two routers came back with empty configs and there was no recent copy. The team wrote a 12-line script that logged in to every router and saved the running config to a dated file. It ran from a scheduler at 02:00. The next failure was a 20-minute recovery.</p><p><b>Lesson:</b> automation is first of all about boring, repeatable jobs done the same way every time.</p></div>

<div class="iv"><p class="q">"Why would you automate with SSH when APIs exist?"</p><p>A strong answer: many devices in a real network only have a CLI, so SSH-based automation reaches everything, including old gear. APIs return structured data and are cleaner when they exist. A good engineer knows both and picks per device. Mention collect, change, verify, and that you never push a change you cannot verify.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A script is a checklist a computer follows exactly, fast and without typos.</li>
<li>Every network script follows collect, change, verify.</li>
<li>"Done" printed by a script proves nothing; reading the state again does.</li>
<li>In the lab, AUTO (10.99.0.100) reaches R1, R2 and R3 on 10.99.0.0/24 with user netops.</li>
<li>You run a Python file with <code>python3 file.py</code> and read the output from top to bottom.</li>
</ul></div>

`,hi:`

<p><b>Is module mein aap kya seekhoge.</b> Aap ek chhota program banana seekhoge jo SSH se routers mein login kare, unka output padhe, configuration badle aur saabit kare ki change sach mein kaam kiya. Aap Python aur netmiko jaisi library <code>nkmiko</code> use karoge. Module ke end tak aap teen routers ka backup loge, ek script se unpar OSPF push karoge, result verify karoge aur error message bina ghabraye padhoge. Yeh CCNP Automation exam (350-901 AUTOCOR) ke device-automation skills hain, aur yahi skills Python for Network Engineers course mein bhi use hote hain.</p>
<p><b>Prerequisites.</b> Aapko router, IP address aur CLI kya hain yeh pata hona chahiye. Coding aani <b>zaroori nahi</b> hai. Is module ki har line of code explain ki gayi hai, aur har chapter ek chhota idea sikhata hai.</p>

<h3>Analogy: ek bahut tez aur bahut careful junior engineer</h3>
<p>Socho aapne junior engineer ko checklist di: "har router mein login karo, <code>show ip interface brief</code> chalao, jawab ek file mein paste karo." Junior list bilkul waise follow karta hai, kabhi bore nahi hota aur kabhi typo nahi karta. <b>Script</b> wahi checklist hai, jo computer ki samajhne wali language mein likhi gayi hai. Computer woh junior hai: tez aur aagyakari, par woh wahi karta hai jo aapne likha, woh nahi jo aapka matlab tha.</p>
<p>Yahi uski taakat bhi hai aur khatra bhi. Script 300 routers ko ek minute mein theek kar sakta hai. Galat script 300 routers ko ek minute mein tod bhi sakta hai. Isliye hum scripts chhote safe steps mein banate hain, aur result hamesha check karte hain.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Lab: ek automation host (AUTO) management network 10.99.0.0/24 par teen routers tak pahunchta hai."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="20" y="85" width="120" height="60" rx="10" fill="#ddd6fe"/><text x="80" y="112" text-anchor="middle" class="svg-ink" font-size="14">AUTO</text><text x="80" y="130" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.100</text><rect x="220" y="85" width="100" height="60" rx="10" fill="#e2e8f0"/><text x="270" y="112" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="270" y="130" text-anchor="middle" class="svg-muted" font-size="12">switch</text><rect x="440" y="10" width="140" height="56" rx="10" fill="#bae6fd"/><text x="510" y="35" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="510" y="53" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.1</text><rect x="440" y="87" width="140" height="56" rx="10" fill="#bae6fd"/><text x="510" y="112" text-anchor="middle" class="svg-ink" font-size="14">R2</text><text x="510" y="130" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.2</text><rect x="440" y="164" width="140" height="56" rx="10" fill="#bae6fd"/><text x="510" y="189" text-anchor="middle" class="svg-ink" font-size="14">R3</text><text x="510" y="207" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.3</text><line x1="140" y1="115" x2="220" y2="115" stroke="#64748b" stroke-width="2"/><line x1="320" y1="115" x2="380" y2="115" stroke="#64748b" stroke-width="2"/><line x1="380" y1="38" x2="380" y2="192" stroke="#64748b" stroke-width="2"/><line x1="380" y1="38" x2="440" y2="38" stroke="#64748b" stroke-width="2"/><line x1="380" y1="115" x2="440" y2="115" stroke="#64748b" stroke-width="2"/><line x1="380" y1="192" x2="440" y2="192" stroke="#64748b" stroke-width="2"/><text x="180" y="105" text-anchor="middle" class="svg-accent" font-size="12">SSH</text></svg><p class="cap">Lab: ek automation host (AUTO) management network 10.99.0.0/24 par teen routers tak pahunchta hai.</p></div>

<h3>Jo lab aap use karoge</h3>
<p><b>AUTO</b> host ek chhota Linux jaisa computer hai jisme Python hai. Teen routers R1, R2 aur R3 management network 10.99.0.0/24 par hain. <b>Management network</b> woh network hai jo sirf devices administer karne ke liye hota hai. AUTO routers mein username <code>netops</code> aur password <code>NK@2026</code> se login karta hai. Yeh lab ki values hain; asli network mein password kabhi script ke andar nahi rehta, aur Chapter 9 dikhata hai ki uski jagah kya karna hai.</p>

<h3>Bada idea: collect, change, verify</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Har network script collect, change, verify hai. Verify woh step hai jo beginners chhod dete hain."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="20" y="40" width="160" height="70" rx="10" fill="#fde68a"/><text x="100" y="72" text-anchor="middle" class="svg-ink" font-size="14">1. Collect</text><text x="100" y="90" text-anchor="middle" class="svg-muted" font-size="12">show output padho</text><rect x="240" y="40" width="160" height="70" rx="10" fill="#bbf7d0"/><text x="320" y="72" text-anchor="middle" class="svg-ink" font-size="14">2. Change</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="12">config lines bhejo</text><rect x="460" y="40" width="160" height="70" rx="10" fill="#ddd6fe"/><text x="540" y="72" text-anchor="middle" class="svg-ink" font-size="14">3. Verify</text><text x="540" y="90" text-anchor="middle" class="svg-muted" font-size="12">dobara padho aur check karo</text><line x1="180" y1="75" x2="240" y2="75" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="400" y1="75" x2="460" y2="75" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><path d="M540 110 Q540 140 320 140 Q100 140 100 110" fill="none" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/></svg><p class="cap">Har network script collect, change, verify hai. Verify woh step hai jo beginners chhod dete hain.</p></div>
<ol>
<li><b>Collect</b>: login karo aur current state padho, jaise <code>show ip interface brief</code>.</li>
<li><b>Change</b>: configuration lines bhejo, sirf zaroorat ho to.</li>
<li><b>Verify</b>: state dobara padho aur test karo ki change sach mein kaam kiya: neighbour up hai, interface par address hai, route maujood hai.</li>
</ol>
<p>Jis script ne "done" print kiya, usne sirf yeh saabit kiya ki text <i>bheja</i> gaya. Yeh saabit nahi hua ki network kaam kar raha hai.</p>

<h3>AUTO host par aapke pehle paanch minute</h3>
<p><b>Script</b> ek text file hai jiska ending <code>.py</code> hota hai. Aap use AUTO terminal se in chhote tools se banate aur chalate ho:</p>
<ul>
<li><code>ls</code> files ki list deta hai, <code>cat file.py</code> ek file dikhata hai, aur <code>nl file.py</code> line numbers ke saath dikhata hai.</li>
<li><code>edit file.py 3 TEXT</code> line 3 ko TEXT se badalta hai. Number ke baad ke spaces rehte hain, jo Python mein zaroori hai.</li>
<li><code>write file.py</code> se poori file type kar sakte ho; khatam karne ke liye alag line par <code>EOF</code> likho.</li>
<li><code>python3 file.py</code> script chalata hai.</li>
</ul>
<p>Sabse chhota script try karo. Isme do lines hain: <code>print()</code> ek <b>function</b> (naam wala action) hai jo screen par text dikhata hai.</p>
<pre class="code">print("Hello, network!")
print("2 + 3 =", 2 + 3)</pre>
<pre class="out">AUTO&gt; python3 hello.py
Hello, network!
2 + 3 = 5</pre>
<p>Python ne file upar se neeche, ek-ek line karke chalayi. Doosri line dikhati hai ki Python calculate bhi kar sakta hai: <code>2 + 3</code> ka <code>5</code> ban gaya.</p>

<div class="eg"><p><b>Worked example.</b> Script ke bina: R1, R2, R3 mein login karo, har ek par <code>show ip interface brief</code> type karo, teen screens text file mein copy karo. Lagbhag das minute ki clicking aur bees mein ek baar chook ka chance. Script ke saath: wahi kaam aath lines ka code hai aur do second leta hai, aur kal bhi waise hi dobara chalaya ja sakta hai. Aap yahi script Chapter 5 mein likhoge.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Script ko magic ya "smart" samajhna. Woh nahi hai. Woh bilkul wahi text bhejta hai jo aapne likha. Agar aapne galat IP address likha, to woh khushi-khushi galat router configure kar dega.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam poochh sakta hai ki kaunsa step automation ko safe banata hai. Jawab verification (aur production se pehle testing) hai, speed nahi. Yeh bhi yaad rakho ki netmiko jaisi library ke saath SSH <i>CLI text</i> automate karta hai, jabki REST APIs (agle do modules) structured data automate karti hain.</p></div>

<div class="scn"><h4>Woh nightly backup jo kisi ne nahi liya</h4><p>Ek retail company ke 40 branch routers the. Rule tha "har raat configs ka backup lo", par yeh manual kaam tha aur log busy hote to chhoot jaata tha. Power failure ke baad do routers khaali config ke saath wapas aaye aur koi recent copy nahi thi. Team ne 12 line ka script likha jo har router mein login karke running config ko dated file mein save karta tha. Woh scheduler se raat 02:00 baje chalta tha. Agli failure sirf 20 minute ki recovery thi.</p><p><b>Lesson:</b> automation sabse pehle boring, repeatable kaam ke liye hai jo har baar ek jaisa hota hai.</p></div>

<div class="iv"><p class="q">"APIs hote hue SSH se automation kyun karoge?"</p><p>Strong jawab: asli network ke bahut saare devices mein sirf CLI hota hai, isliye SSH-based automation har cheez tak pahunchta hai, purane gear tak bhi. APIs structured data deti hain aur jab hon to zyada saaf hain. Achha engineer dono jaanta hai aur device ke hisaab se chunta hai. Collect, change, verify ka zikr karo, aur yeh ki jis change ko verify nahi kar sakte use kabhi push nahi karte.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Script ek checklist hai jise computer bilkul waise follow karta hai, tez aur bina typo ke.</li>
<li>Har network script collect, change, verify follow karta hai.</li>
<li>Script ka print kiya hua "done" kuch saabit nahi karta; state dobara padhna saabit karta hai.</li>
<li>Lab mein AUTO (10.99.0.100) 10.99.0.0/24 par user netops se R1, R2 aur R3 tak pahunchta hai.</li>
<li>Python file <code>python3 file.py</code> se chalti hai aur output upar se neeche padhte hain.</li>
</ul></div>

`}};export{e as default};