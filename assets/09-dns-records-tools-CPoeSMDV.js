var e={id:`dns-records`,h:{en:`DNS record types and testing with nslookup and dig`,hi:`DNS record types aur nslookup aur dig se testing`},body:{en:`
<p>A company directory has more than phone numbers. It lists desk numbers, email addresses, "Priya is now called Priya S., see her new entry", and who manages each department. DNS is the same: a zone holds different <b>record types</b>, each answering a different question. Knowing them, and knowing how to ask for each one, is what separates "DNS is broken" from "the MX record points to the old mail server".</p>

<h3>The record types you must know</h3>
<table class="cmp"><tr><th>Type</th><th>Answers the question</th><th>Example</th></tr>
<tr><td><b>A</b></td><td>What is the IPv4 address of this name?</td><td>www.nwk.lab → 10.1.100.80</td></tr>
<tr><td><b>AAAA</b></td><td>What is the IPv6 address? ("quad A")</td><td>www.nwk.lab → 2001:db8:100::80</td></tr>
<tr><td><b>CNAME</b></td><td>This name is an alias; what is the real (canonical) name?</td><td>portal.nwk.lab → www.nwk.lab</td></tr>
<tr><td><b>MX</b></td><td>Which server receives email for this domain? (with a preference, lower wins)</td><td>nwk.lab → 10 mail.nwk.lab</td></tr>
<tr><td><b>NS</b></td><td>Which servers are authoritative for this zone?</td><td>nwk.lab → ns1.nwk.lab</td></tr>
<tr><td><b>PTR</b></td><td>Reverse lookup: what name belongs to this IP?</td><td>80.100.1.10.in-addr.arpa → www.nwk.lab</td></tr>
<tr><td><b>TXT</b></td><td>Free text, used for SPF mail policy and domain ownership checks</td><td>nwk.lab → "v=spf1 mx -all"</td></tr>
<tr><td><b>SOA</b></td><td>Start of authority: primary server, serial number, timers, negative TTL</td><td>one per zone</td></tr>
</table>

<h4>A few details interviewers love</h4>
<ul>
<li><b>CNAME</b> points to a <b>name</b>, never to an IP. The resolver then looks up that name's A/AAAA record. A CNAME cannot sit at the zone apex (nwk.lab itself), and a name with a CNAME may not have other records.</li>
<li><b>MX</b> also points to a name, which then needs its own A record. With two MX records, preference 10 is tried before 20.</li>
<li><b>PTR</b> lives in a special reverse zone. The IP is written backwards under <code>in-addr.arpa</code>: 10.1.100.80 becomes <code>80.100.1.10.in-addr.arpa</code>. IPv6 reverse uses <code>ip6.arpa</code>, one nibble per label. Reverse records are separate: an A record does not create a PTR automatically.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Forward, alias and reverse lookups">
<rect x="10" y="20" width="150" height="36" rx="8" fill="#bae6fd"/><text x="85" y="43" text-anchor="middle" class="svg-ink" font-size="13">portal.nwk.lab</text>
<rect x="245" y="20" width="150" height="36" rx="8" fill="#bae6fd"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="13">www.nwk.lab</text>
<rect x="480" y="20" width="150" height="36" rx="8" fill="#bbf7d0"/><text x="555" y="43" text-anchor="middle" class="svg-ink" font-size="13">10.1.100.80</text>
<line x1="160" y1="38" x2="245" y2="38" stroke="#64748b" stroke-width="2"/><text x="202" y="72" text-anchor="middle" class="svg-accent" font-size="12">CNAME</text>
<line x1="395" y1="38" x2="480" y2="38" stroke="#64748b" stroke-width="2"/><text x="437" y="72" text-anchor="middle" class="svg-accent" font-size="12">A</text>
<rect x="245" y="120" width="235" height="36" rx="8" fill="#ddd6fe"/><text x="362" y="143" text-anchor="middle" class="svg-ink" font-size="13">80.100.1.10.in-addr.arpa</text>
<line x1="555" y1="56" x2="480" y2="120" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="560" y="100" class="svg-accent" font-size="12">PTR (reverse)</text>
</svg><p class="cap">Forward lookups go name to address, following CNAMEs; reverse lookups use a separate PTR record.</p></div>

<h3>Testing with nslookup</h3>
<p><code>nslookup</code> exists on Windows, Linux and macOS, and is on every help-desk checklist:</p>
<pre class="out">C:\\&gt; nslookup www.nwk.lab
<span class="hl">Server:  dns.nwk.lab
Address:  10.1.100.53</span>

Name:    www.nwk.lab
<span class="hl">Address:  10.1.100.80</span></pre>
<p>The first two lines show <b>which DNS server answered</b>; the last lines show the answer. A "Non-authoritative answer:" line means it came from a resolver's cache rather than directly from the zone's authoritative server; that is normal.</p>
<pre class="code"><span class="c">! useful variations</span>
nslookup www.nwk.lab 10.1.100.53        <span class="c">! ask a specific server</span>
nslookup -type=mx nwk.lab               <span class="c">! ask for a record type</span>
nslookup 10.1.100.80                    <span class="c">! reverse lookup (PTR)</span></pre>
<pre class="out">$ nslookup files.nwk.lab
Server:		10.1.100.53
Address:	10.1.100.53#53

<span class="hl">** server can't find files.nwk.lab: NXDOMAIN</span></pre>
<p><b>NXDOMAIN</b> ("non-existent domain") means the server was reached and says the name does not exist. That is completely different from <code>connection timed out; no servers could be reached</code>, which means the client never got an answer from the DNS server at all (wrong server address, routing, or UDP 53 blocked).</p>

<h3>Testing with dig</h3>
<p><code>dig</code> (Linux and macOS) shows the full DNS message, including the TTL:</p>
<pre class="out">$ dig www.nwk.lab A

; &lt;&lt;&gt;&gt; DiG 9.18.28 &lt;&lt;&gt;&gt; www.nwk.lab A
;; global options: +cmd
;; Got answer:
;; -&gt;&gt;HEADER&lt;&lt;- opcode: QUERY, <span class="hl">status: NOERROR</span>, id: 41277
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

;; QUESTION SECTION:
;www.nwk.lab.			IN	A

;; ANSWER SECTION:
<span class="hl">www.nwk.lab.		3600	IN	A	10.1.100.80</span>

;; Query time: 2 msec
;; SERVER: 10.1.100.53#53(10.1.100.53) (UDP)</pre>
<p>Read four things: the <b>status</b> (NOERROR, NXDOMAIN or SERVFAIL), the <b>flags</b> (<code>aa</code> = authoritative answer, <code>rd</code>/<code>ra</code> = recursion desired/available), the <b>answer</b> with its TTL (3600 seconds), and the <b>SERVER</b> that replied. Handy forms: <code>dig +short www.nwk.lab</code>, <code>dig nwk.lab MX</code>, <code>dig -x 10.1.100.80</code> for reverse, and <code>dig @10.1.100.53 www.nwk.lab</code> to ask a specific server.</p>

<h3>The hosts file</h3>
<p>Before asking DNS, operating systems check a local <b>hosts file</b> (<code>C:\\Windows\\System32\\drivers\\etc\\hosts</code> on Windows, <code>/etc/hosts</code> on Linux and macOS). An old line there silently overrides DNS for that PC only, a classic cause of "it works for everyone except me". Note that <code>nslookup</code> and <code>dig</code> query DNS directly and ignore the hosts file, while <code>ping</code> and browsers use it.</p>

<div class="eg"><p><b>Worked example.</b> A user says portal.nwk.lab opens an old page. <code>nslookup portal.nwk.lab</code> shows an alias to www.nwk.lab and address 10.1.100.80, which is correct. But <code>ping portal.nwk.lab</code> on the same PC replies from 10.1.100.70. Different answers from nslookup and ping on one machine point to a local override: the hosts file had <code>10.1.100.70 portal.nwk.lab</code> from a test last year.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Creating a CNAME that points to an IP address. Adding an A record and expecting reverse lookups to work (you need the PTR too). Reading NXDOMAIN as "DNS server down". Forgetting that nslookup ignores the hosts file.</p></div>
<div class="exam"><p><b>Exam trap.</b> A = IPv4, AAAA = IPv6, CNAME = alias to another name, MX = mail server with preference, NS = authoritative servers, PTR = reverse lookup, TXT = text (SPF, verification), SOA = zone authority and timers.</p></div>

<div class="scn"><h4>Email bouncing after a server move</h4><p>After replacing the mail server, external senders got bounces. <code>dig nwk.lab MX +short</code> showed <code>10 mail.nwk.lab.</code>, correct. <code>dig mail.nwk.lab +short</code> returned the old server's address: the team had updated a new name (mail2) but never changed the A record behind the MX target. Fixing that A record, and waiting out its one-hour TTL, restored mail.</p><p><b>Lesson:</b> MX and CNAME records point to names; always check the A record at the end of the chain.</p></div>

<div class="iv"><p class="q">"What is the difference between an A record, a CNAME and a PTR record?"</p><p>An A record maps a name to an IPv4 address (AAAA for IPv6). A CNAME maps an alias name to a canonical name, which is then resolved with its own A/AAAA record; it never points to an IP. A PTR does the reverse, mapping an address (written backwards under in-addr.arpa) to a name, and must be created separately. Mention MX, NS and TXT for completeness and show you can test each with nslookup -type or dig.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A/AAAA map names to IPv4/IPv6; CNAME is an alias to another name; MX names mail servers with preference.</li>
<li>NS lists authoritative servers; PTR is reverse lookup under in-addr.arpa; TXT holds text such as SPF.</li>
<li><code>nslookup</code> shows which server answered; NXDOMAIN = name missing, timeout = server unreachable.</li>
<li><code>dig</code> shows status, flags, TTL and the answering server.</li>
<li>The hosts file overrides DNS locally; nslookup and dig ignore it.</li>
</ul></div>
`,hi:`
<p>Company directory mein phone numbers se zyada hota hai. Usmein desk numbers, email addresses, "Priya ab Priya S. kehlati hai, uski nayi entry dekho", aur har department ko kaun manage karta hai, sab hota hai. DNS bhi aisa hi hai: zone mein alag alag <b>record types</b> hote hain, har ek alag sawaal ka jawab deta hai. Inhe jaanna, aur har ek ko kaise maangna hai yeh jaanna, hi "DNS toota hua hai" aur "MX record purane mail server ko point karta hai" ke beech ka farak hai.</p>

<h3>Record types jo aapko aane chahiye</h3>
<table class="cmp"><tr><th>Type</th><th>Kis sawaal ka jawab</th><th>Example</th></tr>
<tr><td><b>A</b></td><td>Is naam ka IPv4 address kya hai?</td><td>www.nwk.lab → 10.1.100.80</td></tr>
<tr><td><b>AAAA</b></td><td>IPv6 address kya hai? ("quad A")</td><td>www.nwk.lab → 2001:db8:100::80</td></tr>
<tr><td><b>CNAME</b></td><td>Yeh naam alias hai; asli (canonical) naam kya hai?</td><td>portal.nwk.lab → www.nwk.lab</td></tr>
<tr><td><b>MX</b></td><td>Is domain ka email kaunsa server receive karta hai? (preference ke saath, chhota jeetta hai)</td><td>nwk.lab → 10 mail.nwk.lab</td></tr>
<tr><td><b>NS</b></td><td>Is zone ke liye kaunse servers authoritative hain?</td><td>nwk.lab → ns1.nwk.lab</td></tr>
<tr><td><b>PTR</b></td><td>Reverse lookup: is IP ka naam kya hai?</td><td>80.100.1.10.in-addr.arpa → www.nwk.lab</td></tr>
<tr><td><b>TXT</b></td><td>Free text, SPF mail policy aur domain ownership checks ke liye</td><td>nwk.lab → "v=spf1 mx -all"</td></tr>
<tr><td><b>SOA</b></td><td>Start of authority: primary server, serial number, timers, negative TTL</td><td>har zone mein ek</td></tr>
</table>

<h4>Kuch details jo interviewers ko pasand hain</h4>
<ul>
<li><b>CNAME</b> ek <b>naam</b> ko point karta hai, kabhi IP ko nahi. Resolver phir us naam ka A/AAAA record dhoondhta hai. CNAME zone apex (khud nwk.lab) par nahi ho sakta, aur jis naam par CNAME ho us par doosre records nahi ho sakte.</li>
<li><b>MX</b> bhi ek naam ko point karta hai, jiska apna A record hona chahiye. Do MX records hon to preference 10 wala 20 se pehle try hota hai.</li>
<li><b>PTR</b> ek special reverse zone mein rehta hai. IP ulta likha jaata hai <code>in-addr.arpa</code> ke neeche: 10.1.100.80 ban jaata hai <code>80.100.1.10.in-addr.arpa</code>. IPv6 reverse <code>ip6.arpa</code> use karta hai, har label mein ek nibble. Reverse records alag hote hain: A record apne aap PTR nahi banata.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Forward, alias aur reverse lookups">
<rect x="10" y="20" width="150" height="36" rx="8" fill="#bae6fd"/><text x="85" y="43" text-anchor="middle" class="svg-ink" font-size="13">portal.nwk.lab</text>
<rect x="245" y="20" width="150" height="36" rx="8" fill="#bae6fd"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="13">www.nwk.lab</text>
<rect x="480" y="20" width="150" height="36" rx="8" fill="#bbf7d0"/><text x="555" y="43" text-anchor="middle" class="svg-ink" font-size="13">10.1.100.80</text>
<line x1="160" y1="38" x2="245" y2="38" stroke="#64748b" stroke-width="2"/><text x="202" y="72" text-anchor="middle" class="svg-accent" font-size="12">CNAME</text>
<line x1="395" y1="38" x2="480" y2="38" stroke="#64748b" stroke-width="2"/><text x="437" y="72" text-anchor="middle" class="svg-accent" font-size="12">A</text>
<rect x="245" y="120" width="235" height="36" rx="8" fill="#ddd6fe"/><text x="362" y="143" text-anchor="middle" class="svg-ink" font-size="13">80.100.1.10.in-addr.arpa</text>
<line x1="555" y1="56" x2="480" y2="120" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="560" y="100" class="svg-accent" font-size="12">PTR (reverse)</text>
</svg><p class="cap">Forward lookups naam se address jaate hain, CNAMEs follow karte hue; reverse lookups alag PTR record use karte hain.</p></div>

<h3>nslookup se testing</h3>
<p><code>nslookup</code> Windows, Linux aur macOS teeno par hai, aur har help-desk checklist mein hai:</p>
<pre class="out">C:\\&gt; nslookup www.nwk.lab
<span class="hl">Server:  dns.nwk.lab
Address:  10.1.100.53</span>

Name:    www.nwk.lab
<span class="hl">Address:  10.1.100.80</span></pre>
<p>Pehli do lines dikhati hain <b>kaunse DNS server ne jawab diya</b>; aakhri lines jawab dikhati hain. "Non-authoritative answer:" line ka matlab hai jawab zone ke authoritative server se seedha nahi, balki resolver ke cache se aaya; yeh normal hai.</p>
<pre class="code"><span class="c">! useful variations</span>
nslookup www.nwk.lab 10.1.100.53        <span class="c">! specific server se poocho</span>
nslookup -type=mx nwk.lab               <span class="c">! record type maango</span>
nslookup 10.1.100.80                    <span class="c">! reverse lookup (PTR)</span></pre>
<pre class="out">$ nslookup files.nwk.lab
Server:		10.1.100.53
Address:	10.1.100.53#53

<span class="hl">** server can't find files.nwk.lab: NXDOMAIN</span></pre>
<p><b>NXDOMAIN</b> ("non-existent domain") ka matlab hai server tak pahunche aur woh kehta hai naam exist nahi karta. Yeh <code>connection timed out; no servers could be reached</code> se bilkul alag hai, jiska matlab hai client ko DNS server se kabhi jawab mila hi nahi (galat server address, routing, ya UDP 53 blocked).</p>

<h3>dig se testing</h3>
<p><code>dig</code> (Linux aur macOS) poora DNS message dikhata hai, TTL ke saath:</p>
<pre class="out">$ dig www.nwk.lab A

; &lt;&lt;&gt;&gt; DiG 9.18.28 &lt;&lt;&gt;&gt; www.nwk.lab A
;; global options: +cmd
;; Got answer:
;; -&gt;&gt;HEADER&lt;&lt;- opcode: QUERY, <span class="hl">status: NOERROR</span>, id: 41277
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

;; QUESTION SECTION:
;www.nwk.lab.			IN	A

;; ANSWER SECTION:
<span class="hl">www.nwk.lab.		3600	IN	A	10.1.100.80</span>

;; Query time: 2 msec
;; SERVER: 10.1.100.53#53(10.1.100.53) (UDP)</pre>
<p>Chaar cheezein padho: <b>status</b> (NOERROR, NXDOMAIN ya SERVFAIL), <b>flags</b> (<code>aa</code> = authoritative answer, <code>rd</code>/<code>ra</code> = recursion desired/available), TTL ke saath <b>answer</b> (3600 seconds), aur jawab dene wala <b>SERVER</b>. Kaam ke forms: <code>dig +short www.nwk.lab</code>, <code>dig nwk.lab MX</code>, reverse ke liye <code>dig -x 10.1.100.80</code>, aur specific server se poochne ke liye <code>dig @10.1.100.53 www.nwk.lab</code>.</p>

<h3>Hosts file</h3>
<p>DNS se poochne se pehle operating systems ek local <b>hosts file</b> check karte hain (Windows par <code>C:\\Windows\\System32\\drivers\\etc\\hosts</code>, Linux aur macOS par <code>/etc/hosts</code>). Wahan ki koi purani line sirf us PC ke liye DNS ko chupchaap override kar deti hai, "sabke liye chalta hai mere alawa" ka classic kaaran. Dhyan do ki <code>nslookup</code> aur <code>dig</code> DNS se seedha poochte hain aur hosts file ignore karte hain, jabki <code>ping</code> aur browsers use use karte hain.</p>

<div class="eg"><p><b>Worked example.</b> User kehta hai portal.nwk.lab purana page kholta hai. <code>nslookup portal.nwk.lab</code> www.nwk.lab ka alias aur address 10.1.100.80 dikhata hai, jo sahi hai. Lekin usi PC par <code>ping portal.nwk.lab</code> 10.1.100.70 se reply karta hai. Ek hi machine par nslookup aur ping ke alag jawab local override ki taraf ishara karte hain: hosts file mein pichhle saal ke test se <code>10.1.100.70 portal.nwk.lab</code> pada tha.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Aisa CNAME banana jo IP address ko point kare. A record add karke reverse lookups ke kaam karne ki ummeed karna (PTR bhi chahiye). NXDOMAIN ko "DNS server down" padhna. Bhool jaana ki nslookup hosts file ignore karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> A = IPv4, AAAA = IPv6, CNAME = doosre naam ka alias, MX = preference ke saath mail server, NS = authoritative servers, PTR = reverse lookup, TXT = text (SPF, verification), SOA = zone authority aur timers.</p></div>

<div class="scn"><h4>Server move ke baad email bounce</h4><p>Mail server badalne ke baad external senders ko bounces mile. <code>dig nwk.lab MX +short</code> ne <code>10 mail.nwk.lab.</code> dikhaya, sahi. <code>dig mail.nwk.lab +short</code> ne purane server ka address lautaya: team ne ek naya naam (mail2) update kiya tha lekin MX target ke peeche ka A record kabhi nahi badla. Woh A record theek karne, aur uske ek ghante ke TTL ka wait karne ke baad mail wapas chalne laga.</p><p><b>Seekh:</b> MX aur CNAME records names ko point karte hain; chain ke end par A record hamesha check karo.</p></div>

<div class="iv"><p class="q">"A record, CNAME aur PTR record mein kya farak hai?"</p><p>A record naam ko IPv4 address se map karta hai (IPv6 ke liye AAAA). CNAME ek alias naam ko canonical naam se map karta hai, jo phir apne A/AAAA record se resolve hota hai; yeh kabhi IP ko point nahi karta. PTR ulta karta hai, address (in-addr.arpa ke neeche ulta likha) ko naam se map karta hai, aur alag se banana padta hai. Completeness ke liye MX, NS aur TXT ka zikr karo aur dikhao ki aap har ek ko nslookup -type ya dig se test kar sakte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A/AAAA names ko IPv4/IPv6 se map karte hain; CNAME doosre naam ka alias hai; MX preference ke saath mail servers batata hai.</li>
<li>NS authoritative servers list karta hai; PTR in-addr.arpa ke neeche reverse lookup hai; TXT SPF jaisa text rakhta hai.</li>
<li><code>nslookup</code> dikhata hai kaunse server ne jawab diya; NXDOMAIN = naam missing, timeout = server unreachable.</li>
<li><code>dig</code> status, flags, TTL aur jawab dene wala server dikhata hai.</li>
<li>Hosts file DNS ko locally override karti hai; nslookup aur dig use ignore karte hain.</li>
</ul></div>
`}};export{e as default};