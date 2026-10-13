var e={id:`actions`,h:{en:`Actions: accept, discard, reject, count, log`,hi:`Actions: accept, discard, reject, count, log`},body:{en:`
<p>The <code>then</code> statement says what to do with a packet that matched. Junos groups actions into <b>terminating</b> actions, which decide the packet's fate, and <b>modifiers</b> (also called action modifiers), which add side effects such as counting or logging. Understanding the difference explains many "why was my packet accepted?" puzzles.</p>

<h3>Analogy: the security guard's three jobs</h3>
<p>A guard can do three things. First, make a decision: let the visitor in, or turn them away. Second, tell the visitor why they were turned away, or say nothing. Third, write notes in a notebook: tally marks and a log of names. Decisions are terminating actions. Tally marks and the logbook are modifiers.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Terminating actions and modifiers">
<rect x="20" y="20" width="270" height="190" rx="10" fill="#fecaca"/><text x="155" y="45" text-anchor="middle" class="svg-ink" font-size="14">Terminating actions</text>
<text x="155" y="80" text-anchor="middle" class="svg-ink" font-size="13">accept: let it through</text>
<text x="155" y="110" text-anchor="middle" class="svg-ink" font-size="13">discard: drop silently</text>
<text x="155" y="140" text-anchor="middle" class="svg-ink" font-size="13">reject: drop + ICMP message</text>
<text x="155" y="180" text-anchor="middle" class="svg-muted" font-size="12">evaluation stops here</text>
<rect x="350" y="20" width="270" height="190" rx="10" fill="#bbf7d0"/><text x="485" y="45" text-anchor="middle" class="svg-ink" font-size="14">Modifiers</text>
<text x="485" y="80" text-anchor="middle" class="svg-ink" font-size="13">count NAME: tally packets</text>
<text x="485" y="110" text-anchor="middle" class="svg-ink" font-size="13">log: keep header in memory</text>
<text x="485" y="140" text-anchor="middle" class="svg-ink" font-size="13">syslog: send to syslog</text>
<text x="485" y="180" text-anchor="middle" class="svg-muted" font-size="12">do not decide by themselves</text>
</svg><p class="cap">A term usually combines one terminating action with zero or more modifiers.</p></div>

<h3>The terminating actions</h3>
<table class="cmp"><tr><th>Action</th><th>Effect</th><th>When to use</th></tr>
<tr><td><code>accept</code></td><td>Packet passes</td><td>Permit rules</td></tr>
<tr><td><code>discard</code></td><td>Packet is dropped silently; the sender sees a timeout</td><td>Protecting the router; do not reveal the filter</td></tr>
<tr><td><code>reject</code></td><td>Packet is dropped and an ICMP unreachable (default code: administratively prohibited) is sent back to the source</td><td>Internal networks, so users see "connection refused" quickly</td></tr></table>
<p>You can choose the reject message, for example <code>reject tcp-reset</code> or <code>reject port-unreachable</code>. Only one terminating action may appear in a term: configuring both <code>discard</code> and <code>reject</code> is invalid, so you delete one before you set the other.</p>

<h3>The modifiers</h3>
<ul>
<li><b><code>count NAME</code></b> adds every matching packet to a named counter. Look at it with <code>show firewall</code> or <code>show firewall filter FILTER</code>. Counters show bytes and packets.</li>
<li><b><code>log</code></b> records the packet header in a memory buffer, readable with <code>show firewall log</code>. The buffer is small and old entries are overwritten.</li>
<li><b><code>syslog</code></b> sends a message to the system log file instead (usually <code>/var/log/messages</code>). Better for long-term records.</li>
<li><b><code>next term</code></b> tells Junos to continue to the next term after applying modifiers, even though this term matched.</li>
</ul>

<h3>The count-only rule</h3>
<p>If a term has <b>only modifiers</b> and no terminating action, the packet is <b>accepted</b>. Look at this:</p>
<pre class="code">term WEB-HITS {
    from {
        protocol tcp;
        destination-port 80;
    }
    then count web-hits;
}</pre>
<p>Packets to port 80 are counted and accepted. They do not continue to later terms. This catches people out: a counting term placed above a block rule can let the packet escape the block. If you want to count and still go on to later terms, add <code>next term</code>:</p>
<pre class="code">then {
    count web-hits;
    next term;
}</pre>

<h3>Showing the results</h3>
<pre class="out">lab@R1&gt; show firewall

Filter: LAN-IN
Counters:
Name                                                Bytes              Packets
<span class="hl">bad-host                                            1344                   16</span>

lab@R1&gt; show firewall log
Log :
Time      Filter    Action Interface           Protocol        Src Addr                         Dest Addr
05:07:10  pfe       R      -                   ICMP            10.40.1.66                       10.40.9.10
05:07:10  pfe       R      -                   ICMP            10.40.1.66                       10.40.9.10</pre>
<p>In the log, the Action column uses letters: <b>A</b> accept, <b>D</b> discard, <b>R</b> reject. <code>clear firewall all</code> resets counters; <code>clear firewall log</code> clears the log buffer.</p>

<div class="eg"><p><b>Worked example.</b> Host 10.40.1.66 sends 16 ping packets of 84 bytes. The term <code>from source-address 10.40.1.66/32; then { count bad-host; discard; }</code> sees them. Counter bad-host shows 16 packets and 1344 bytes (16 x 84). The host sees only timeouts. With <code>reject</code> instead of <code>discard</code> the host would see "destination unreachable - administratively prohibited" and the log would show action R.</p></div>

<h3>Discard or reject: which should you choose?</h3>
<ul>
<li><b>discard</b> on the edge towards the internet or on the lo0 filter. Silence gives an attacker no information and costs no response traffic.</li>
<li><b>reject</b> inside your own network. Users see an immediate refusal instead of waiting for a timeout, which makes troubleshooting faster.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Using <code>log</code> as the only evidence. The log buffer is memory only and rolls over. Use <code>count</code> for reliable numbers and <code>syslog</code> when you must keep the record.</p></div>
<div class="exam"><p><b>Exam trap.</b> "A term has only <code>count hits</code>. What happens to matching packets?" They are counted and <b>accepted</b>. Another favourite: the difference between discard (silent) and reject (ICMP error returned).</p></div>

<div class="scn"><h4>Proving the numbers to management</h4><p>A desktop team said one office PC was flooding the billing server. Management wanted evidence before approving an isolation. The engineer added a term that counted and discarded traffic from that PC's address. Within an hour the counter showed 52,000 packets. He pasted the output into the ticket, and the PC was reimaged the same day. Because the term also had <code>log</code> for a short period, the log showed the PC contacting the server every few milliseconds.</p><p><b>Lesson:</b> count turns an opinion into a number.</p></div>

<div class="iv"><p class="q">"What is the difference between discard and reject in a Junos filter?"</p><p>Strong answer: both drop the packet and end evaluation. discard is silent, so the sender sees a timeout. reject sends an ICMP unreachable message back, administratively prohibited by default, so the sender knows quickly. I use discard toward untrusted networks and on the loopback filter, and reject inside the company. Count and log are modifiers, and a term with only modifiers accepts the packet.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Terminating actions: accept, discard, reject. One per term.</li>
<li>Modifiers: count, log, syslog (and next term) add side effects.</li>
<li>A term with only modifiers accepts the packet unless you add next term.</li>
<li>Read counters with show firewall and the log with show firewall log.</li>
<li>discard is silent; reject returns an ICMP message.</li>
</ul></div>
`,hi:`
<p><code>then</code> statement batata hai ki jo packet match hua uska kya karna hai. Junos actions ko <b>terminating</b> actions mein baantta hai, jo packet ka fate decide karte hain, aur <b>modifiers</b> (action modifiers), jo counting ya logging jaise side effects jodte hain. Yeh farak samajhne se kai "mera packet accept kyun hua?" puzzles solve ho jaate hain.</p>

<h3>Analogy: security guard ke teen kaam</h3>
<p>Guard teen cheezein kar sakta hai. Pehla, decision lena: visitor ko andar aane do ya wapas karo. Doosra, visitor ko batana ki kyun wapas kiya, ya kuch na kehna. Teesra, notebook mein notes likhna: tally marks aur naamon ka log. Decisions terminating actions hain. Tally marks aur logbook modifiers hain.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Terminating actions and modifiers">
<rect x="20" y="20" width="270" height="190" rx="10" fill="#fecaca"/><text x="155" y="45" text-anchor="middle" class="svg-ink" font-size="14">Terminating actions</text>
<text x="155" y="80" text-anchor="middle" class="svg-ink" font-size="13">accept: jaane do</text>
<text x="155" y="110" text-anchor="middle" class="svg-ink" font-size="13">discard: chupchap drop</text>
<text x="155" y="140" text-anchor="middle" class="svg-ink" font-size="13">reject: drop + ICMP message</text>
<text x="155" y="180" text-anchor="middle" class="svg-muted" font-size="12">evaluation yahin ruk jaata hai</text>
<rect x="350" y="20" width="270" height="190" rx="10" fill="#bbf7d0"/><text x="485" y="45" text-anchor="middle" class="svg-ink" font-size="14">Modifiers</text>
<text x="485" y="80" text-anchor="middle" class="svg-ink" font-size="13">count NAME: packets tally</text>
<text x="485" y="110" text-anchor="middle" class="svg-ink" font-size="13">log: header memory mein</text>
<text x="485" y="140" text-anchor="middle" class="svg-ink" font-size="13">syslog: syslog ko bhejo</text>
<text x="485" y="180" text-anchor="middle" class="svg-muted" font-size="12">akele decide nahi karte</text>
</svg><p class="cap">Term aksar ek terminating action aur zero ya zyada modifiers milata hai.</p></div>

<h3>Terminating actions</h3>
<table class="cmp"><tr><th>Action</th><th>Asar</th><th>Kab use karein</th></tr>
<tr><td><code>accept</code></td><td>Packet guzarta hai</td><td>Permit rules</td></tr>
<tr><td><code>discard</code></td><td>Packet chupchap drop; sender ko timeout dikhta hai</td><td>Router ko bachana; filter reveal na karo</td></tr>
<tr><td><code>reject</code></td><td>Packet drop aur source ko ICMP unreachable (default code: administratively prohibited) bheja jaata hai</td><td>Internal networks, taaki users ko jaldi "connection refused" dikhe</td></tr></table>
<p>Aap reject ka message chun sakte ho, jaise <code>reject tcp-reset</code> ya <code>reject port-unreachable</code>. Ek term mein sirf ek terminating action ho sakta hai: <code>discard</code> aur <code>reject</code> dono configure karna invalid hai, isliye ek delete karke doosra set karo.</p>

<h3>Modifiers</h3>
<ul>
<li><b><code>count NAME</code></b> har matching packet ko naam wale counter mein jodta hai. <code>show firewall</code> ya <code>show firewall filter FILTER</code> se dekho. Counters bytes aur packets dikhate hain.</li>
<li><b><code>log</code></b> packet header ko memory buffer mein record karta hai, <code>show firewall log</code> se padha jaata hai. Buffer chhota hai aur purani entries overwrite hoti hain.</li>
<li><b><code>syslog</code></b> system log file mein message bhejta hai (aksar <code>/var/log/messages</code>). Lambe time ke records ke liye behtar.</li>
<li><b><code>next term</code></b> Junos ko batata hai ki modifiers lagakar agle term par jao, chahe yeh term match hua ho.</li>
</ul>

<h3>Count-only rule</h3>
<p>Agar term mein <b>sirf modifiers</b> hon aur terminating action na ho, to packet <b>accept</b> hota hai. Yeh dekho:</p>
<pre class="code">term WEB-HITS {
    from {
        protocol tcp;
        destination-port 80;
    }
    then count web-hits;
}</pre>
<p>Port 80 ke packets count hote hain aur accept hote hain. Woh baad ke terms tak nahi jaate. Yeh logo ko pakad leta hai: block rule ke upar rakha counting term packet ko block se bacha sakta hai. Agar count karke bhi aage ke terms tak jaana hai to <code>next term</code> jodo:</p>
<pre class="code">then {
    count web-hits;
    next term;
}</pre>

<h3>Results dekhna</h3>
<pre class="out">lab@R1&gt; show firewall

Filter: LAN-IN
Counters:
Name                                                Bytes              Packets
<span class="hl">bad-host                                            1344                   16</span>

lab@R1&gt; show firewall log
Log :
Time      Filter    Action Interface           Protocol        Src Addr                         Dest Addr
05:07:10  pfe       R      -                   ICMP            10.40.1.66                       10.40.9.10
05:07:10  pfe       R      -                   ICMP            10.40.1.66                       10.40.9.10</pre>
<p>Log mein Action column akshar use karta hai: <b>A</b> accept, <b>D</b> discard, <b>R</b> reject. <code>clear firewall all</code> counters reset karta hai; <code>clear firewall log</code> log buffer saaf karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Host 10.40.1.66 84 bytes ke 16 ping packets bhejta hai. Term <code>from source-address 10.40.1.66/32; then { count bad-host; discard; }</code> unhe dekhta hai. Counter bad-host 16 packets aur 1344 bytes (16 x 84) dikhata hai. Host ko sirf timeouts dikhte hain. <code>discard</code> ki jagah <code>reject</code> hota to host ko "destination unreachable - administratively prohibited" dikhta aur log mein action R hota.</p></div>

<h3>Discard ya reject: kaunsa chunein?</h3>
<ul>
<li>Internet ki taraf edge par ya lo0 filter mein <b>discard</b>. Chuppi attacker ko koi information nahi deti aur response traffic ka kharcha nahi.</li>
<li>Apne network ke andar <b>reject</b>. Users ko timeout ka intezaar karne ki jagah turant refusal dikhta hai, jisse troubleshooting tez hoti hai.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Sirf <code>log</code> ko saboot maanna. Log buffer sirf memory mein hai aur roll over hota hai. Bharosemand numbers ke liye <code>count</code> aur record rakhna ho to <code>syslog</code> use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Term mein sirf <code>count hits</code> hai. Matching packets ka kya hoga?" Woh count hote hain aur <b>accept</b> hote hain. Ek aur favourite: discard (silent) aur reject (ICMP error wapas) ka farak.</p></div>

<div class="scn"><h4>Management ko numbers dikhana</h4><p>Desktop team ne kaha ki ek office PC billing server ko flood kar raha hai. Management isolation approve karne se pehle saboot chahta tha. Engineer ne ek term joda jo us PC ke address ka traffic count aur discard karta tha. Ek ghante mein counter ne 52,000 packets dikhaye. Usne output ticket mein paste kiya, aur PC usi din reimage ho gaya. Kyunki term mein thode time ke liye <code>log</code> bhi tha, log mein dikha ki PC server ko har kuch milliseconds mein contact kar raha tha.</p><p><b>Lesson:</b> count raay ko number bana deta hai.</p></div>

<div class="iv"><p class="q">"Junos filter mein discard aur reject mein kya farak hai?"</p><p>Strong answer: dono packet drop karte hain aur evaluation rokte hain. discard silent hai, isliye sender ko timeout dikhta hai. reject ICMP unreachable message wapas bhejta hai, default mein administratively prohibited, isliye sender ko jaldi pata chalta hai. Main untrusted networks ki taraf aur loopback filter mein discard use karta hoon, company ke andar reject. Count aur log modifiers hain, aur sirf modifiers wala term packet accept karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Terminating actions: accept, discard, reject. Ek term mein ek.</li>
<li>Modifiers: count, log, syslog (aur next term) side effects jodte hain.</li>
<li>Sirf modifiers wala term packet accept karta hai jab tak next term na jodo.</li>
<li>Counters show firewall se, log show firewall log se padho.</li>
<li>discard silent hai; reject ICMP message wapas bhejta hai.</li>
</ul></div>
`}};export{e as default};