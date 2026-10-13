var e={id:`big-picture`,h:{en:`The big picture: from CLI scraping to model-driven programmability`,hi:`Big picture: CLI scraping se model-driven programmability tak`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these twelve chapters you will be able to read a YANG model and its tree, enable NETCONF and RESTCONF on an IOS XE router, read and change configuration with NETCONF <code>get-config</code> and <code>edit-config</code>, build RESTCONF URIs and choose the right verb, interpret every common status code and JSON payload, describe the REST APIs of Cisco Catalyst Center and Catalyst SD-WAN Manager, and explain model-driven telemetry. These are ENCOR 350-401 v1.2 blueprint items <b>6.3</b>, <b>6.4</b> and <b>6.5</b>. You will practise in two labs: <i>YANG data via NETCONF and RESTCONF</i> and the ticket <i>RESTCONF keeps saying no</i>.</p>
<p><b>Prerequisites.</b> Comfort with the IOS XE CLI, basic IP addressing and OSPF, and the previous module <i>Python &amp; JSON for network engineers</i>, where you met JSON objects, lists and REST calls. We will refresh JSON only where it matters for reading API answers. The next module, <i>Embedded Event Manager</i>, automates on the box itself; here we automate from the outside.</p>

<h3>An analogy: the paper form versus the chat</h3>
<p>Imagine ordering a passport. In the old way you phone the office and chat: the clerk answers in free sentences, a bit differently every time, and you write notes. That is <b>CLI scraping</b>: a script sends <code>show</code> commands over SSH and then hunts through the text with regular expressions. Now imagine a printed <b>form</b> with numbered boxes: every box has a name, a type (date, number, yes/no) and a rule (mandatory or optional). Anyone, human or computer, can fill it and read it without guessing. That form is a <b>data model</b>. In networking the language used to write such forms is <b>YANG</b>, and the ways to post the form to the device are <b>NETCONF</b>, <b>RESTCONF</b> and <b>gNMI</b>.</p>

<h3>Why CLI scraping fails</h3>
<ul>
<li><b>The text is for humans.</b> Column widths, headers and wording change between releases and platforms. A regex that parsed <code>show ip interface brief</code> on one release breaks on the next.</li>
<li><b>No types.</b> Is <code>1000</code> a speed in Mbps, a VLAN or an MTU? The script must guess from position.</li>
<li><b>No transaction.</b> If line 7 of a 20-line change is rejected, lines 1 to 6 are already live. The script only knows by parsing error text such as <code>% Invalid input detected</code>.</li>
<li><b>No reliable success signal.</b> A CLI prompt returning does not mean the change worked.</li>
</ul>
<p><b>Model-driven programmability</b> fixes all four: the device exposes configuration and operational state as <b>structured data</b> that follows a <b>YANG model</b>; programs read and write it through an <b>API</b>; the reply is machine-readable (an <code>&lt;ok/&gt;</code>, a status code, an error-tag); and changes are validated against the model before they touch the running configuration.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Model-driven stack">
<rect x="20" y="20" width="600" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">Data model: YANG (IETF, OpenConfig, native)</text>
<rect x="20" y="75" width="600" height="40" rx="8" fill="#bae6fd"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="14">Encoding: XML, JSON, protobuf (GPB)</text>
<rect x="20" y="130" width="190" height="40" rx="8" fill="#bbf7d0"/><text x="115" y="155" text-anchor="middle" class="svg-ink" font-size="13">NETCONF</text>
<rect x="225" y="130" width="190" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="13">RESTCONF</text>
<rect x="430" y="130" width="190" height="40" rx="8" fill="#bbf7d0"/><text x="525" y="155" text-anchor="middle" class="svg-ink" font-size="13">gNMI</text>
<rect x="20" y="185" width="190" height="40" rx="8" fill="#fde68a"/><text x="115" y="210" text-anchor="middle" class="svg-ink" font-size="12">SSH, TCP 830</text>
<rect x="225" y="185" width="190" height="40" rx="8" fill="#fde68a"/><text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="12">HTTPS, TCP 443</text>
<rect x="430" y="185" width="190" height="40" rx="8" fill="#fde68a"/><text x="525" y="210" text-anchor="middle" class="svg-ink" font-size="12">gRPC over HTTP/2</text>
<text x="320" y="245" text-anchor="middle" class="svg-muted" font-size="12">one model, several encodings, several protocols</text>
</svg><p class="cap">The model-driven stack: the model says what the data is; the protocol says how you move it.</p></div>

<h3>The four layers you must keep apart</h3>
<dl class="terms">
<dt>Data model</dt><dd>The schema: which nodes exist, their names, types and rules. Written in YANG (RFC 7950).</dd>
<dt>Encoding</dt><dd>How an instance of the data is written on the wire: XML (NETCONF, RESTCONF), JSON (RESTCONF), protocol buffers (gNMI and telemetry).</dd>
<dt>Protocol</dt><dd>The operations: NETCONF RPCs such as <code>get-config</code>, RESTCONF verbs such as GET and PATCH, gNMI Get/Set/Subscribe.</dd>
<dt>Transport</dt><dd>The secure pipe: SSH for NETCONF, HTTPS (TLS) for RESTCONF, gRPC over HTTP/2 for gNMI.</dd>
</dl>
<p>One YANG model can be reached by all three protocols. In Lab 1 you add Loopback100 with NETCONF in XML and read it back with RESTCONF in JSON; both talk to the same datastore on R1, and the change also appears in <code>show running-config</code>.</p>

<div class="eg"><p><b>Worked example.</b> A script needs the description of GigabitEthernet0/1 on 400 routers. With scraping it runs <code>show interfaces description</code>, splits columns by spaces and fails on the first description that contains two spaces. With RESTCONF it sends one GET to <code>/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet0%2F1/description</code> and receives <code>{"ietf-interfaces:description": "CORE-LINK-R2"}</code>. Same answer on every release, on every platform that supports the model.</p></div>

<h3>The lab topology</h3>
<p>Lab 1 uses DEVBOX (192.168.50.10, your automation host), access switch SW1, router R1 (management address 192.168.50.1 on G0/0, 10.0.12.1/30 towards R2, Loopback0 1.1.1.1) and R2 as an OSPF neighbour. The API account is <code>devnet</code> / <code>DevNet123</code> with privilege 15. Lab 2 uses DEVBOX 192.168.60.10 and distribution switch DSW1 at 192.168.60.2 with the account <code>automation</code> / <code>ApiPass1</code>.</p>
<pre class="code"><span class="c">! The whole module in one picture</span>
DEVBOX (192.168.50.10) --- SW1 --- R1 G0/0 192.168.50.1 --- R2
<span class="c">! NETCONF: SSH to 192.168.50.1 port 830</span>
<span class="c">! RESTCONF: HTTPS to 192.168.50.1 port 443, path /restconf/data/...</span></pre>

<div class="warn"><p><b>Common mistake.</b> Thinking YANG is a protocol. YANG only describes data. You never "send YANG"; you send XML or JSON that follows a YANG model, using NETCONF, RESTCONF or gNMI.</p></div>
<div class="exam"><p><b>Exam trap.</b> Port numbers: NETCONF uses <b>TCP 830</b> over SSH, RESTCONF uses <b>TCP 443</b> over HTTPS. SNMP (UDP 161) is not model-driven programmability even though it has a MIB, which is also a data model.</p></div>

<div class="scn"><h4>The upgrade that broke the inventory script</h4><p>A retail company collected serial numbers from 900 branch routers with a script that parsed <code>show version</code>. After an IOS XE upgrade the line layout changed and the script silently stored empty serials for half the fleet. The audit only noticed weeks later. The team rewrote the job to read the hardware inventory through RESTCONF using a YANG operational model, where the serial is a named leaf with a fixed type.</p><p><b>Lesson:</b> text output is a user interface, not an API; structured data from a model survives upgrades.</p></div>

<div class="iv"><p class="q">"Why would you use NETCONF or RESTCONF instead of Paramiko and show commands?"</p><p>Strong answer: CLI output is unstructured and changes between releases, so parsing is fragile. Model-driven APIs return typed, structured data defined by YANG, validate changes against the model before applying them, give a clear success or error reply, and NETCONF adds transactions and locking. Mention that the same model works over NETCONF, RESTCONF and gNMI.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CLI scraping is fragile: human text, no types, no transactions, no reliable success signal.</li>
<li>Model-driven programmability = YANG model + encoding + protocol + secure transport.</li>
<li>NETCONF: SSH, TCP 830, XML. RESTCONF: HTTPS, TCP 443, JSON or XML. gNMI: gRPC.</li>
<li>YANG describes data; it is not a protocol.</li>
<li>Blueprint items covered: 6.3 (YANG), 6.4 (Catalyst Center and SD-WAN Manager APIs), 6.5 (status codes and payloads).</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In barah chapters ke end tak aap ek YANG model aur uska tree padh paoge, IOS XE router par NETCONF aur RESTCONF enable kar paoge, NETCONF <code>get-config</code> aur <code>edit-config</code> se configuration padh aur badal paoge, RESTCONF URIs bana paoge aur sahi verb chun paoge, har common status code aur JSON payload samajh paoge, Cisco Catalyst Center aur Catalyst SD-WAN Manager ke REST APIs describe kar paoge, aur model-driven telemetry explain kar paoge. Yeh ENCOR 350-401 v1.2 blueprint ke items <b>6.3</b>, <b>6.4</b> aur <b>6.5</b> hain. Aap do labs mein practice karoge: <i>YANG data via NETCONF and RESTCONF</i> aur ticket <i>RESTCONF keeps saying no</i>.</p>
<p><b>Prerequisites.</b> IOS XE CLI, basic IP addressing aur OSPF mein comfort, aur pichla module <i>Python &amp; JSON for network engineers</i>, jahan aapne JSON objects, lists aur REST calls dekhe. JSON ko hum sirf wahan refresh karenge jahan API answers padhne ke liye zaroori hai. Agla module, <i>Embedded Event Manager</i>, box ke andar hi automate karta hai; yahan hum bahar se automate karte hain.</p>

<h3>Ek analogy: paper form vs baatcheet</h3>
<p>Passport banwane ka socho. Purane tarike mein aap office ko phone karke baat karte ho: clerk free sentences mein jawab deta hai, har baar thoda alag, aur aap notes likhte ho. Yahi <b>CLI scraping</b> hai: script SSH par <code>show</code> commands bhejti hai aur phir regular expressions se text mein dhoondhti hai. Ab ek printed <b>form</b> socho jisme numbered boxes hain: har box ka naam hai, type hai (date, number, haan/na) aur rule hai (mandatory ya optional). Koi bhi, insaan ya computer, bina guess kiye use bhar aur padh sakta hai. Woh form ek <b>data model</b> hai. Networking mein aise forms likhne ki language <b>YANG</b> hai, aur form ko device tak bhejne ke tarike <b>NETCONF</b>, <b>RESTCONF</b> aur <b>gNMI</b> hain.</p>

<h3>CLI scraping kyun fail hoti hai</h3>
<ul>
<li><b>Text insaanon ke liye hai.</b> Column widths, headers aur wording releases aur platforms ke beech badalte hain. Jo regex ek release par <code>show ip interface brief</code> parse karta tha, woh agle par toot jaata hai.</li>
<li><b>Koi types nahi.</b> <code>1000</code> Mbps mein speed hai, VLAN hai ya MTU? Script ko position se guess karna padta hai.</li>
<li><b>Koi transaction nahi.</b> Agar 20-line change ki line 7 reject ho jaaye, to lines 1 se 6 pehle hi live hain. Script ko sirf <code>% Invalid input detected</code> jaisa error text parse karke pata chalta hai.</li>
<li><b>Success ka bharosemand signal nahi.</b> CLI prompt wapas aane ka matlab yeh nahi ki change kaam kar gaya.</li>
</ul>
<p><b>Model-driven programmability</b> chaaron ko theek karti hai: device configuration aur operational state ko <b>structured data</b> ki tarah dikhata hai jo ek <b>YANG model</b> follow karta hai; programs use ek <b>API</b> se padhte aur likhte hain; reply machine-readable hota hai (ek <code>&lt;ok/&gt;</code>, ek status code, ek error-tag); aur changes running configuration ko chhoone se pehle model ke against validate hote hain.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Model-driven stack">
<rect x="20" y="20" width="600" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">Data model: YANG (IETF, OpenConfig, native)</text>
<rect x="20" y="75" width="600" height="40" rx="8" fill="#bae6fd"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="14">Encoding: XML, JSON, protobuf (GPB)</text>
<rect x="20" y="130" width="190" height="40" rx="8" fill="#bbf7d0"/><text x="115" y="155" text-anchor="middle" class="svg-ink" font-size="13">NETCONF</text>
<rect x="225" y="130" width="190" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="13">RESTCONF</text>
<rect x="430" y="130" width="190" height="40" rx="8" fill="#bbf7d0"/><text x="525" y="155" text-anchor="middle" class="svg-ink" font-size="13">gNMI</text>
<rect x="20" y="185" width="190" height="40" rx="8" fill="#fde68a"/><text x="115" y="210" text-anchor="middle" class="svg-ink" font-size="12">SSH, TCP 830</text>
<rect x="225" y="185" width="190" height="40" rx="8" fill="#fde68a"/><text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="12">HTTPS, TCP 443</text>
<rect x="430" y="185" width="190" height="40" rx="8" fill="#fde68a"/><text x="525" y="210" text-anchor="middle" class="svg-ink" font-size="12">HTTP/2 par gRPC</text>
<text x="320" y="245" text-anchor="middle" class="svg-muted" font-size="12">ek model, kai encodings, kai protocols</text>
</svg><p class="cap">Model-driven stack: model batata hai data kya hai; protocol batata hai use kaise le jaana hai.</p></div>

<h3>Chaar layers jinhe alag rakhna zaroori hai</h3>
<dl class="terms">
<dt>Data model</dt><dd>Schema: kaunse nodes exist karte hain, unke naam, types aur rules. YANG (RFC 7950) mein likha jaata hai.</dd>
<dt>Encoding</dt><dd>Data ka ek instance wire par kaise likha jaata hai: XML (NETCONF, RESTCONF), JSON (RESTCONF), protocol buffers (gNMI aur telemetry).</dd>
<dt>Protocol</dt><dd>Operations: NETCONF RPCs jaise <code>get-config</code>, RESTCONF verbs jaise GET aur PATCH, gNMI Get/Set/Subscribe.</dd>
<dt>Transport</dt><dd>Secure pipe: NETCONF ke liye SSH, RESTCONF ke liye HTTPS (TLS), gNMI ke liye HTTP/2 par gRPC.</dd>
</dl>
<p>Ek YANG model tak teeno protocols se pahuncha ja sakta hai. Lab 1 mein aap NETCONF se XML mein Loopback100 add karte ho aur RESTCONF se JSON mein wapas padhte ho; dono R1 ke same datastore se baat karte hain, aur change <code>show running-config</code> mein bhi dikhta hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek script ko 400 routers par GigabitEthernet0/1 ka description chahiye. Scraping mein woh <code>show interfaces description</code> chalati hai, spaces se columns todti hai aur pehle hi description par fail ho jaati hai jisme do spaces hon. RESTCONF mein woh <code>/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet0%2F1/description</code> par ek GET bhejti hai aur <code>{"ietf-interfaces:description": "CORE-LINK-R2"}</code> paati hai. Har release par, har us platform par jo model support karta hai, same jawab.</p></div>

<h3>Lab topology</h3>
<p>Lab 1 mein DEVBOX (192.168.50.10, aapka automation host), access switch SW1, router R1 (G0/0 par management address 192.168.50.1, R2 ki taraf 10.0.12.1/30, Loopback0 1.1.1.1) aur OSPF neighbour ki tarah R2 hai. API account <code>devnet</code> / <code>DevNet123</code> hai, privilege 15 ke saath. Lab 2 mein DEVBOX 192.168.60.10 aur distribution switch DSW1 192.168.60.2 par hai, account <code>automation</code> / <code>ApiPass1</code> ke saath.</p>
<pre class="code"><span class="c">! Poora module ek picture mein</span>
DEVBOX (192.168.50.10) --- SW1 --- R1 G0/0 192.168.50.1 --- R2
<span class="c">! NETCONF: 192.168.50.1 port 830 par SSH</span>
<span class="c">! RESTCONF: 192.168.50.1 port 443 par HTTPS, path /restconf/data/...</span></pre>

<div class="warn"><p><b>Common galti.</b> YANG ko protocol samajhna. YANG sirf data describe karta hai. Aap kabhi "YANG nahi bhejte"; aap XML ya JSON bhejte ho jo YANG model follow karta hai, NETCONF, RESTCONF ya gNMI use karke.</p></div>
<div class="exam"><p><b>Exam trap.</b> Port numbers: NETCONF SSH par <b>TCP 830</b> use karta hai, RESTCONF HTTPS par <b>TCP 443</b>. SNMP (UDP 161) model-driven programmability nahi hai, bhale hi uske paas MIB hai, jo bhi ek data model hai.</p></div>

<div class="scn"><h4>Upgrade jisne inventory script tod di</h4><p>Ek retail company 900 branch routers se serial numbers ek script se collect karti thi jo <code>show version</code> parse karti thi. IOS XE upgrade ke baad line layout badal gaya aur script ne chupchaap aadhe fleet ke liye khaali serials store kar diye. Audit ne yeh hafton baad pakda. Team ne job ko dobara likha taaki woh YANG operational model use karke RESTCONF se hardware inventory padhe, jahan serial ek naam wali leaf hai jiska type fixed hai.</p><p><b>Seekh:</b> text output ek user interface hai, API nahi; model se aaya structured data upgrades jhel leta hai.</p></div>

<div class="iv"><p class="q">"Aap Paramiko aur show commands ki jagah NETCONF ya RESTCONF kyun use karoge?"</p><p>Strong answer: CLI output unstructured hota hai aur releases ke beech badalta hai, isliye parsing fragile hai. Model-driven APIs YANG se define hua typed, structured data dete hain, changes apply karne se pehle model ke against validate karte hain, saaf success ya error reply dete hain, aur NETCONF transactions aur locking jodta hai. Batao ki same model NETCONF, RESTCONF aur gNMI teeno par kaam karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CLI scraping fragile hai: insaani text, koi types nahi, koi transactions nahi, success ka bharosemand signal nahi.</li>
<li>Model-driven programmability = YANG model + encoding + protocol + secure transport.</li>
<li>NETCONF: SSH, TCP 830, XML. RESTCONF: HTTPS, TCP 443, JSON ya XML. gNMI: gRPC.</li>
<li>YANG data describe karta hai; yeh protocol nahi hai.</li>
<li>Cover hone wale blueprint items: 6.3 (YANG), 6.4 (Catalyst Center aur SD-WAN Manager APIs), 6.5 (status codes aur payloads).</li>
</ul></div>
`}};export{e as default};