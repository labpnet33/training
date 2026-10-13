var e=e=>`<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Troubleshooting method">
<rect x="10" y="30" width="115" height="60" rx="8" fill="#bae6fd"/><text x="67" y="55" text-anchor="middle" class="svg-ink" font-size="12">1 Reproduce</text><text x="67" y="73" text-anchor="middle" class="svg-muted" font-size="10">nc, curl</text>
<rect x="135" y="30" width="115" height="60" rx="8" fill="#fed7aa"/><text x="192" y="55" text-anchor="middle" class="svg-ink" font-size="12">2 Read rules</text><text x="192" y="73" text-anchor="middle" class="svg-muted" font-size="10">status numbered</text>
<rect x="260" y="30" width="115" height="60" rx="8" fill="#ddd6fe"/><text x="317" y="55" text-anchor="middle" class="svg-ink" font-size="12">3 Check kernel</text><text x="317" y="73" text-anchor="middle" class="svg-muted" font-size="10">iptables -L -n</text>
<rect x="385" y="30" width="115" height="60" rx="8" fill="#fecaca"/><text x="442" y="55" text-anchor="middle" class="svg-ink" font-size="12">4 Fix one thing</text><text x="442" y="73" text-anchor="middle" class="svg-muted" font-size="10">delete, add</text>
<rect x="510" y="30" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="570" y="55" text-anchor="middle" class="svg-ink" font-size="12">5 Prove it</text><text x="570" y="73" text-anchor="middle" class="svg-muted" font-size="10">retest both sides</text>
</svg><p class="cap">`+e+`</p></div>`,t=`<pre class="code">priya@priya-ws:~$ nc -zv 10.99.0.20 22
amit@sales-pc07:~$ curl 10.99.0.20
amit@sales-pc07:~$ nc -zv 10.99.0.20 80</pre>
<pre class="out">nc: connect to 10.99.0.20 port 22 (tcp) <span class="hl">timed out</span>: Operation now in progress
curl: (28) Failed to connect to 10.99.0.20 port 80 after 2001 ms: <span class="hl">Timeout was reached</span>
nc: connect to 10.99.0.20 port 80 (tcp) <span class="hl">timed out</span>: Operation now in progress</pre>`,n=`<pre class="code">netadmin@nms03:~$ sudo ufw status numbered</pre>
<pre class="out">Status: active

     To                         Action      From
     --                         ------      ----
<span class="hl">[ 1] 22/tcp                     DENY IN     Anywhere</span>
[ 2] 22/tcp                     ALLOW IN    10.99.0.0/24
<span class="hl">[ 3] 80/udp                     ALLOW IN    Anywhere</span>
[ 4] 514/udp                    ALLOW IN    10.99.0.0/24</pre>`,r=`<pre class="code">netadmin@nms03:~$ sudo iptables -L -n</pre>
<pre class="out">Chain INPUT (policy DROP)
target     prot opt source               destination
ACCEPT     all  --  anywhere             anywhere             ctstate RELATED,ESTABLISHED
ACCEPT     icmp --  anywhere             anywhere             icmp echo-request
<span class="hl">DROP       tcp  --  anywhere             anywhere             tcp dpt:22</span>
ACCEPT     tcp  --  10.99.0.0/24         anywhere             tcp dpt:22
<span class="hl">ACCEPT     udp  --  anywhere             anywhere             udp dpt:80</span>
ACCEPT     udp  --  10.99.0.0/24         anywhere             udp dpt:514

Chain FORWARD (policy DROP)
target     prot opt source               destination

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination</pre>`,i=`<pre class="code">netadmin@nms03:~$ sudo grep -c BLOCK /var/log/ufw.log</pre>
<pre class="out">3</pre>`,a=`<pre class="code">netadmin@nms03:~$ sudo ufw delete 1
netadmin@nms03:~$ sudo ufw delete allow 80/udp
netadmin@nms03:~$ sudo ufw allow 80/tcp
netadmin@nms03:~$ sudo ufw status numbered</pre>
<pre class="out">Deleting:
 deny 22/tcp
Rule deleted
Rule deleted
Rule added
Status: active

     To                         Action      From
     --                         ------      ----
[ 1] 22/tcp                     ALLOW IN    10.99.0.0/24
[ 2] 514/udp                    ALLOW IN    10.99.0.0/24
[ 3] 80/tcp                     ALLOW IN    Anywhere</pre>`,o=`<pre class="code">priya@priya-ws:~$ nc -zv 10.99.0.20 22
amit@sales-pc07:~$ curl 10.99.0.20 | head -n 4
amit@sales-pc07:~$ nc -zv 10.99.0.20 22</pre>
<pre class="out">Connection to 10.99.0.20 22 port [tcp/ssh] <span class="hl">succeeded!</span>
&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
&lt;title&gt;<span class="hl">Welcome to nginx!</span>&lt;/title&gt;
nc: connect to 10.99.0.20 port 22 (tcp) <span class="hl">timed out</span>: Operation now in progress</pre>`,s={id:`troubleshooting`,h:{en:`Ticket NK-2503: fixing a firewall that locked everyone out`,hi:`Ticket NK-2503: sabko lock out karne wale firewall ko theek karna`},body:{en:`
<p>Ticket NK-2503 (priority 2): "After the weekend hardening on NMS03, the NOC cannot SSH to it and the sales team cannot open the monitoring dashboard." The firewall was enabled by someone else. Your job is to find out why, fix it with the smallest change, and prove it from both sides. The same method works on any host firewall problem.</p>
`+e(`Reproduce, read the rules, check the kernel, fix one thing, prove it.`)+`
<h3>Step 1: reproduce from the client</h3>
<p>Never start by editing rules. First see the problem the way the user sees it:</p>
`+t+`
<p>Three <b>timeouts</b>. By chapter 5 you know what that suggests: packets are silently dropped, which is typical of a firewall deny. A <b>refused</b> would have pointed at the service instead. The firewall is a strong suspect, but we do not trust a guess yet.</p>

<h3>Step 2: read the rules, in order</h3>
`+n+`
<p>Read it as an auditor, top to bottom, applying the first-match rule from chapter 4:</p>
<ul>
<li><b>Rule 1</b> denies 22/tcp from <b>Anywhere</b>. It sits above rule 2, so every SSH packet hits it first, including those from the management network 10.99.0.0/24. Rule 2 is never reached. This explains the first timeout.</li>
<li><b>Rule 3</b> allows port <b>80/udp</b>. The web dashboard uses TCP, so this rule matches nothing the browser sends. The dashboard is therefore dropped by the default policy. This explains the second and third timeouts.</li>
<li>Rule 4 is correct: syslog over UDP 514 from the management network.</li>
</ul>
<p>Two different mistakes behind one complaint: a deny in the wrong place, and the right port with the wrong protocol.</p>

<h3>Step 3: confirm in the kernel and the log</h3>
<p>The kernel view must match what ufw says. It is a cheap check that catches surprises:</p>
`+r+`
<p>The highlighted lines match exactly: a <code>DROP tcp ... dpt:22</code> before the allow for the management network, and an <code>ACCEPT udp ... dpt:80</code>. Now the log, counting the blocked packets:</p>
`+i+`
<p>Three blocked packets were recorded. A number is a good opening for questions, not a conclusion. Reading the lines themselves (chapter 6) would show which sources and ports.</p>

<h3>Step 4: fix with the smallest change</h3>
<p>Change only what is wrong, one command at a time, and read each answer. Rule 1 is the broken deny: it is removed by number, after you have just looked at the numbering. The wrong web rule is removed by its words, and the right rule is added:</p>
`+a+`
<p>Note that no rule was added for SSH: the existing rule 2 was already right, once the deny above it was gone. The default deny still blocks everyone outside the management network. This is the power of fixing the cause, not adding more rules around it. The list now has three lines and every line says exactly one thing.</p>

<h3>Step 5: prove it from both sides</h3>
`+o+`
<p>The workstation inside the management network reaches SSH. The sales PC loads the dashboard, and <b>still cannot reach SSH</b>, as designed. A fix that opens too much is not a fix. Both sides are tested, and both match the intention. Now you can write the ticket note: cause (a deny above the allow, and an allow for the wrong protocol), change (three commands, listed above), evidence (the outputs).</p>

<div class="eg"><p><b>Worked example.</b> A colleague proposes: "Just run <code>ufw disable</code> to stop the complaints." The cost: every port, including the stray ones, is open to the whole network until someone remembers to switch it back. Compare: three targeted commands, two minutes, full security retained. Always prefer the fix that keeps the policy.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Adding a new allow above the broken deny instead of removing it; fixing only one of two causes and declaring victory; testing only from the allowed side; forgetting to tell the user what changed.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Add an allow rule for the management network." If a deny for Anywhere is above it, the new allow must go <b>above</b> the deny, or the deny must be deleted. Position matters.</p></div>
<div class="scn"><h4>Two bugs, one complaint</h4><p>Management reported "the server is down". The engineer found the SSH deny, fixed it, and closed the ticket. The next morning the sales team complained about the dashboard. The second bug, a UDP rule for a TCP service, had been hidden behind the first. The new runbook says: after the fix, test every service listed in the plan, not only the one in the complaint.</p><p><b>Lesson:</b> prove the whole plan, not only the reported symptom.</p></div>
<div class="iv"><p class="q">"Users cannot reach a service behind a host firewall. How do you troubleshoot?"</p><p>I reproduce from the client with nc or curl and note timeout or refused. On the server I read the rules in order, compare with the kernel view and the firewall log, fix the smallest thing, and retest from allowed and disallowed clients. I record the cause and the commands in the ticket.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Reproduce first, edit later. Timeouts suggest a firewall; refused suggests the service.</li>
<li>Read <code>ufw status numbered</code> top to bottom; look for a deny above an allow and a wrong protocol.</li>
<li>Check the kernel with <code>iptables -L -n</code> and the log with grep.</li>
<li>Fix the cause, not the symptom, and prove the fix from both sides.</li>
</ul></div>
`,hi:`
<p>Ticket NK-2503 (priority 2): "NMS03 par weekend hardening ke baad NOC SSH nahi kar pa raha aur sales team monitoring dashboard nahi khol pa rahi." Firewall kisi aur ne enable kiya tha. Aapka kaam hai pata lagana kyun, sabse chhote badlav se fix karna, aur dono taraf se sabit karna. Yahi tareeka kisi bhi host firewall problem par kaam karta hai.</p>
`+e(`Reproduce, rules padho, kernel check, ek cheez fix, sabit karo.`)+`
<h3>Step 1: client se reproduce karo</h3>
<p>Kabhi rules edit karke shuru mat karo. Pehle problem ko waise dekho jaise user dekhta hai:</p>
`+t+`
<p>Teen <b>timeouts</b>. Chapter 5 se aap jaante ho yeh kya sujhata hai: packets chupchaap drop ho rahe hain, jo firewall deny ki pehchaan hai. <b>Refused</b> service ki taraf ishara karta. Firewall ka shak mazboot hai, par abhi anuman par bharosa nahi karte.</p>

<h3>Step 2: rules order mein padho</h3>
`+n+`
<p>Auditor ki tarah upar se neeche padho, chapter 4 ka first-match niyam lagakar:</p>
<ul>
<li><b>Rule 1</b> 22/tcp ko <b>Anywhere</b> se deny karta hai. Yeh rule 2 ke upar hai, isliye har SSH packet pehle isse takraata hai, management network 10.99.0.0/24 ke packets bhi. Rule 2 tak kabhi nahi pahunchte. Yeh pehle timeout ko samjhata hai.</li>
<li><b>Rule 3</b> port <b>80/udp</b> allow karta hai. Web dashboard TCP use karta hai, isliye yeh rule browser ke bheje kisi packet se match nahi karta. Dashboard default policy se drop hota hai. Yeh doosre aur teesre timeout ko samjhata hai.</li>
<li>Rule 4 sahi hai: management network se UDP 514 par syslog.</li>
</ul>
<p>Ek shikayat ke peeche do alag galtiyan: galat jagah deny, aur sahi port par galat protocol.</p>

<h3>Step 3: kernel aur log mein confirm karo</h3>
<p>Kernel view ufw ke kehne se match karna chahiye. Yeh sasta check hai jo surprises pakadta hai:</p>
`+r+`
<p>Highlighted lines bilkul match karti hain: management network ke allow se pehle <code>DROP tcp ... dpt:22</code>, aur <code>ACCEPT udp ... dpt:80</code>. Ab log, blocked packets ginte hue:</p>
`+i+`
<p>Teen blocked packets record hue. Number sawaalon ki acchi shuruaat hai, nateeja nahi. Lines khud padhne se (chapter 6) pata chalta ki kaunse sources aur ports.</p>

<h3>Step 4: sabse chhote badlav se fix</h3>
<p>Sirf jo galat hai woh badlo, ek ek command, aur har jawab padho. Rule 1 toota hua deny hai: numbering abhi dekhne ke baad woh number se hataya jaata hai. Galat web rule uske shabdon se hataya jaata hai, aur sahi rule joda jaata hai:</p>
`+a+`
<p>Dhyan do ki SSH ke liye koi rule nahi joda gaya: maujooda rule 2 pehle se sahi tha, bas uske upar ka deny hat gaya. Default deny ab bhi management network ke bahar ke sabko block karta hai. Yeh karan ko theek karne ki taaqat hai, uske aaspaas aur rules lagane ki nahi. List ab teen lines ki hai aur har line theek ek baat kehti hai.</p>

<h3>Step 5: dono taraf se sabit karo</h3>
`+o+`
<p>Management network ke andar ka workstation SSH tak pahunchta hai. Sales PC dashboard load karta hai, aur <b>ab bhi SSH tak nahi pahunchta</b>, design ke mutabiq. Jo fix zyada khol de woh fix nahi. Dono taraf test hui, dono iraade se milti hain. Ab ticket note likh sakte ho: karan (allow ke upar deny, aur galat protocol ka allow), badlav (teen commands, upar), saboot (outputs).</p>

<div class="eg"><p><b>Worked example.</b> Ek colleague kehta hai: "Shikayatein rokne ke liye bas <code>ufw disable</code> chalao." Keemat: har port, stray wale bhi, poore network ke liye khule rehte hain jab tak koi wapas on karna na yaad kare. Tulna: teen targeted commands, do minute, poori security barkarar. Hamesha woh fix chuno jo policy rakhe.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Toote hue deny ko hatane ki jagah uske upar naya allow jodna; do mein se sirf ek karan theek karke jeet ghoshit karna; sirf allowed side se test karna; user ko badlav batana bhool jaana.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Management network ke liye allow rule jodo." Agar Anywhere ka deny uske upar hai, to naya allow deny ke <b>upar</b> jaana chahiye, ya deny delete hona chahiye. Position matter karti hai.</p></div>
<div class="scn"><h4>Do bugs, ek shikayat</h4><p>Management ne report kiya "server down hai". Engineer ne SSH deny dhoonda, theek kiya aur ticket band kiya. Agli subah sales team ne dashboard ki shikayat ki. Doosra bug, TCP service ke liye UDP rule, pehle ke peeche chhipa tha. Naye runbook mein likha hai: fix ke baad plan ki har service test karo, sirf shikayat wali nahi.</p><p><b>Lesson:</b> poora plan sabit karo, sirf report hua lakshan nahi.</p></div>
<div class="iv"><p class="q">"Host firewall ke peeche ki service tak users nahi pahunch pa rahe. Troubleshoot kaise karoge?"</p><p>Client se nc ya curl se reproduce karta hoon aur timeout ya refused note karta hoon. Server par rules order mein padhta hoon, kernel view aur firewall log se milata hoon, sabse chhoti cheez fix karta hoon, aur allowed aur disallowed clients se dobara test karta hoon. Karan aur commands ticket mein likhta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle reproduce, baad mein edit. Timeout firewall sujhata hai; refused service.</li>
<li><code>ufw status numbered</code> upar se neeche padho; allow ke upar deny aur galat protocol dhoondho.</li>
<li>Kernel <code>iptables -L -n</code> se aur log grep se check karo.</li>
<li>Karan theek karo, lakshan nahi, aur fix dono taraf se sabit karo.</li>
</ul></div>
`}};export{s as default};