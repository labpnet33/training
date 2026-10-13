var e={id:`control-lifecycle`,h:{en:`The life of a control connection: states, steps and a branch coming online`,hi:`Control connection ka jeevan: states, steps aur branch ka online aana`},body:{en:`
<p>Picture a new employee arriving at a secure campus. At the gate the guard checks the badge and the visitor list (Validator). The guard then points to the correct building and floor, and the visitor goes there (Controller and Manager). At each door the badge is checked again. After that the visitor sends short "I am here" signals so that the office knows they are present. A control connection has the same life: introduction, handover, authentication, keep-alive, and in the end a clean or sudden goodbye.</p>

<h3>The steps for an edge</h3>
<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Life of a control connection">
<rect x="10" y="100" width="100" height="70" rx="10" fill="#bbf7d0"/><text x="60" y="130" text-anchor="middle" class="svg-ink" font-size="13">WAN edge</text><text x="60" y="148" text-anchor="middle" class="svg-muted" font-size="10">E-DEL-1</text>
<rect x="260" y="10" width="120" height="55" rx="10" fill="#ddd6fe"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Validator</text><text x="320" y="50" text-anchor="middle" class="svg-muted" font-size="10">198.51.100.30</text>
<rect x="500" y="100" width="130" height="55" rx="10" fill="#bae6fd"/><text x="565" y="123" text-anchor="middle" class="svg-ink" font-size="13">Controller</text><text x="565" y="140" text-anchor="middle" class="svg-muted" font-size="10">198.51.100.20</text>
<rect x="260" y="210" width="120" height="55" rx="10" fill="#fde68a"/><text x="320" y="233" text-anchor="middle" class="svg-ink" font-size="13">Manager</text><text x="320" y="250" text-anchor="middle" class="svg-muted" font-size="10">198.51.100.10</text>
<path d="M110 115 L260 45" stroke="#64748b" stroke-width="2" fill="none"/><text x="150" y="68" class="svg-ink" font-size="11">1 connect, authenticate</text>
<path d="M110 150 L500 125" stroke="#64748b" stroke-width="2" fill="none" stroke-dasharray="5 4"/><text x="300" y="138" class="svg-ink" font-size="11">2 learn addresses, drop vbond, connect</text>
<path d="M110 160 L260 235" stroke="#64748b" stroke-width="2" fill="none"/><text x="120" y="215" class="svg-ink" font-size="11">3 connect to Manager</text>
</svg><p class="cap">The edge starts at the Validator and ends with the Controller and the Manager.</p></div>
<ol>
<li><b>Reach.</b> The edge has an address in VPN 0, a default route and the Validator address in its system block.</li>
<li><b>DTLS to the Validator.</b> The edge and Validator exchange and check certificates, then the organization names, then the Validator checks the edge's serial number against the list.</li>
<li><b>Information.</b> The Validator returns the addresses of the Controllers and the Manager, and the edge's public address after NAT, so the edge knows its public side.</li>
<li><b>Tear down.</b> The edge closes the Validator connection. This is why a healthy edge shows no vbond row.</li>
<li><b>Controller and Manager.</b> The edge repeats the certificate, organization name and serial checks with each. It forms one connection per TLOC to each Controller (limit by <code>max-control-connections</code>) and one to the Manager.</li>
<li><b>OMP and run time.</b> OMP starts over the Controller connection. Hello messages keep the connections alive.</li>
</ol>

<h3>The states you will see</h3>
<table class="cmp"><tr><th>State</th><th>Meaning</th><th>If it stays here</th></tr>
<tr><td>connect</td><td>The device is trying to open the connection</td><td>No reachability, a blocked port, wrong address or no response</td></tr>
<tr><td>handshake</td><td>The secure session is being negotiated</td><td>Certificate or protocol mismatch, packet loss, MTU problems</td></tr>
<tr><td>challenge</td><td>The peers are verifying each other's identity</td><td>Certificate not trusted, serial not on the list, organization mismatch</td></tr>
<tr><td>up</td><td>The connection is established</td><td>Healthy</td></tr>
<tr><td>tear_down</td><td>The connection is being closed</td><td>Look at the error code in the history</td></tr></table>
<p>The exact set of states varies a little between releases, but the logic is stable: connect first, then identity checks, then up. A device stuck in connect points to the network. A device stuck later points to identity.</p>

<h3>Keep-alives and failure detection</h3>
<p>The two sides send hello messages on the control connection every second by default, and the connection is declared dead when no hello is received within the hello tolerance, 12 seconds by default. After a failure, the edge starts again from the beginning and tries to reconnect. Existing data-plane tunnels continue during this time, as chapter 11 reminds you.</p>

<h3>Reading the live state</h3>
<pre class="out">E-DEL-1# show sdwan control connections
PEER    PEER  PEER          SITE  DOMAIN  PEER           LOCAL
TYPE    PROT  SYSTEM IP     ID    ID      PRIVATE IP     COLOR         STATE
vsmart  dtls  10.255.255.2  1     1       198.51.100.20  biz-internet  <span class="hl">up</span>
vmanage dtls  10.255.255.1  1     0       198.51.100.10  biz-internet  <span class="hl">up</span></pre>
<pre class="out">E-DEL-1# show sdwan control local-properties
organization-name            NK-LAB
certificate-status           Installed
root-ca-chain-status         Installed
certificate-validity         Valid
system-ip                    10.255.0.11
site-id                      100
<span class="hl">number-vbond-peers            1</span>
controller-groups-list       0</pre>
<p>The first command shows who the edge is connected to now. The second shows the edge's own identity and certificate state, which is the first thing to compare when the first command shows connect or challenge.</p>

<h3>The history</h3>
<pre class="out">E-DEL-1# show sdwan control connection-history
PEER   PEER IP         PUBLIC IP       LOCAL COLOR  STATE      LOCAL ERROR  REMOTE ERROR
vbond  198.51.100.30   198.51.100.30   biz-internet connect    <span class="hl">DCONFAIL</span>     NOERR
vbond  198.51.100.30   198.51.100.30   biz-internet challenge  <span class="hl">CRTREJSER</span>    NOERR
vbond  198.51.100.30   198.51.100.30   biz-internet up         NOERR        NOERR</pre>
<p>This history shows an edge that failed on reachability, then failed on a certificate check, and finally came up once both were fixed. The last two columns are the most useful. Chapter 11 explains the main codes.</p>

<div class="eg"><p><b>Counting expected rows.</b> E-DEL-1 has two transports (biz-internet and mpls) and the fabric has one Controller. Expected: two vsmart rows (one per transport) and one vmanage row, all up. If it shows one vsmart row only, the second transport has a problem. If it shows three rows but one says connect, that transport cannot reach the Controller or has an identity problem.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Expecting a vbond row on a healthy edge; looking at the Controller instead of the edge when only one transport is down; ignoring the history and guessing; comparing times without noticing that clocks differ between devices.</p></div>

<div class="exam"><p><b>Exam traps.</b> The edge drops the Validator connection once the Controller is up. The edge forms one Manager connection even with two transports. Stuck in connect means reachability; stuck at challenge means identity. The history shows local and remote error codes.</p></div>

<div class="scn"><h4>A branch coming online</h4><p>Bengaluru's new router E-BLR-1 was plugged in at 10:00. At 10:01 it received an address by DHCP. At 10:02 the history showed a DCONFAIL to the Validator, the firewall at the site had not yet been given the control ports. The network team opened them. At 10:05 the history showed challenge for a few seconds and then up. By 10:06 the Controller listed the new OMP peer and BFD sessions were forming. The branch joined with no intervention on the controllers.</p><p><b>Lesson:</b> the history tells the story in order. Read from the top to the bottom.</p></div>

<div class="iv"><p class="q">"Walk me through what happens when a new edge boots."</p><p>Strong answer: it gets an IP and a default route in VPN 0, connects with DTLS to the Validator and is authenticated by certificate, organization name and the authorised list. The Validator tells it the Controller and Manager addresses and its NAT-mapped address, and the edge drops that connection. It connects to the Controller and Manager, OMP starts, then BFD tunnels form.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: Validator, then Controller and Manager; the Validator connection is dropped.</li>
<li>States: connect, handshake, challenge, up, tear_down.</li>
<li>Stuck in connect means network; stuck later means identity.</li>
<li>Hello every second, dead after 12 seconds by default.</li>
<li>Use show sdwan control connections, local-properties and connection-history.</li>
</ul></div>
`,hi:`
<p>Ek naye employee ko secure campus mein aate hue socho. Gate par guard badge aur visitor list check karta hai (Validator). Phir guard sahi building aur floor batata hai, aur visitor wahan jaata hai (Controller aur Manager). Har darwaze par badge dobara check hota hai. Uske baad visitor chhote "main yahan hoon" signals bhejta hai taaki office ko pata rahe ki woh maujood hai. Control connection ka jeevan bhi aisa hi hai: parichay, handover, authentication, keep-alive, aur ant mein saaf ya achanak alvida.</p>

<h3>Edge ke steps</h3>
<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Control connection ka jeevan">
<rect x="10" y="100" width="100" height="70" rx="10" fill="#bbf7d0"/><text x="60" y="130" text-anchor="middle" class="svg-ink" font-size="13">WAN edge</text><text x="60" y="148" text-anchor="middle" class="svg-muted" font-size="10">E-DEL-1</text>
<rect x="260" y="10" width="120" height="55" rx="10" fill="#ddd6fe"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Validator</text><text x="320" y="50" text-anchor="middle" class="svg-muted" font-size="10">198.51.100.30</text>
<rect x="500" y="100" width="130" height="55" rx="10" fill="#bae6fd"/><text x="565" y="123" text-anchor="middle" class="svg-ink" font-size="13">Controller</text><text x="565" y="140" text-anchor="middle" class="svg-muted" font-size="10">198.51.100.20</text>
<rect x="260" y="210" width="120" height="55" rx="10" fill="#fde68a"/><text x="320" y="233" text-anchor="middle" class="svg-ink" font-size="13">Manager</text><text x="320" y="250" text-anchor="middle" class="svg-muted" font-size="10">198.51.100.10</text>
<path d="M110 115 L260 45" stroke="#64748b" stroke-width="2" fill="none"/><text x="150" y="68" class="svg-ink" font-size="11">1 connect, authenticate</text>
<path d="M110 150 L500 125" stroke="#64748b" stroke-width="2" fill="none" stroke-dasharray="5 4"/><text x="300" y="138" class="svg-ink" font-size="11">2 addresses seekho, vbond chhodo, connect</text>
<path d="M110 160 L260 235" stroke="#64748b" stroke-width="2" fill="none"/><text x="120" y="215" class="svg-ink" font-size="11">3 Manager se connect</text>
</svg><p class="cap">Edge Validator se shuru karta hai aur Controller aur Manager par khatam.</p></div>
<ol>
<li><b>Pahunch.</b> Edge ke paas VPN 0 mein address, default route aur system block mein Validator address hota hai.</li>
<li><b>Validator tak DTLS.</b> Edge aur Validator certificates exchange karke check karte hain, phir organization names, phir Validator edge ka serial number list se check karta hai.</li>
<li><b>Jaankari.</b> Validator Controllers aur Manager ke addresses, aur NAT ke baad edge ka public address lautata hai, taaki edge ko apna public side pata chale.</li>
<li><b>Tear down.</b> Edge Validator connection band kar deta hai. Isiliye healthy edge par vbond row nahi dikhti.</li>
<li><b>Controller aur Manager.</b> Edge har ek ke saath certificate, organization name aur serial checks dohrata hai. Woh har Controller se har TLOC par ek connection (<code>max-control-connections</code> tak) aur Manager se ek connection banata hai.</li>
<li><b>OMP aur run time.</b> OMP Controller connection par shuru hota hai. Hello messages connections ko zinda rakhte hain.</li>
</ol>

<h3>States jo aap dekhoge</h3>
<table class="cmp"><tr><th>State</th><th>Matlab</th><th>Agar yahin atke</th></tr>
<tr><td>connect</td><td>Device connection kholne ki koshish kar raha hai</td><td>Reachability nahi, blocked port, galat address ya jawab nahi</td></tr>
<tr><td>handshake</td><td>Secure session negotiate ho raha hai</td><td>Certificate ya protocol mismatch, packet loss, MTU problems</td></tr>
<tr><td>challenge</td><td>Peers ek doosre ki identity verify kar rahe hain</td><td>Certificate trusted nahi, serial list mein nahi, organization mismatch</td></tr>
<tr><td>up</td><td>Connection ban gaya</td><td>Healthy</td></tr>
<tr><td>tear_down</td><td>Connection band ho raha hai</td><td>History mein error code dekho</td></tr></table>
<p>States ka exact set releases ke beech thoda badalta hai, par logic sthir hai: pehle connect, phir identity checks, phir up. Connect mein atka device network ki taraf ishaara karta hai. Baad mein atka device identity ki taraf.</p>

<h3>Keep-alives aur failure detection</h3>
<p>Dono sides control connection par default roop se har second hello messages bhejti hain, aur connection tab dead maana jaata hai jab hello tolerance, default 12 second, ke andar koi hello na mile. Failure ke baad edge shuru se dobara reconnect karne ki koshish karta hai. Maujooda data-plane tunnels is dauran chalte rehte hain, jaisa chapter 11 yaad dilata hai.</p>

<h3>Live state padhna</h3>
<pre class="out">E-DEL-1# show sdwan control connections
PEER    PEER  PEER          SITE  DOMAIN  PEER           LOCAL
TYPE    PROT  SYSTEM IP     ID    ID      PRIVATE IP     COLOR         STATE
vsmart  dtls  10.255.255.2  1     1       198.51.100.20  biz-internet  <span class="hl">up</span>
vmanage dtls  10.255.255.1  1     0       198.51.100.10  biz-internet  <span class="hl">up</span></pre>
<pre class="out">E-DEL-1# show sdwan control local-properties
organization-name            NK-LAB
certificate-status           Installed
root-ca-chain-status         Installed
certificate-validity         Valid
system-ip                    10.255.0.11
site-id                      100
<span class="hl">number-vbond-peers            1</span>
controller-groups-list       0</pre>
<p>Pehla command dikhata hai ki edge abhi kis se connected hai. Doosra edge ki apni identity aur certificate state dikhata hai, jo pehle command ke connect ya challenge dikhane par sabse pehle compare karna hai.</p>

<h3>History</h3>
<pre class="out">E-DEL-1# show sdwan control connection-history
PEER   PEER IP         PUBLIC IP       LOCAL COLOR  STATE      LOCAL ERROR  REMOTE ERROR
vbond  198.51.100.30   198.51.100.30   biz-internet connect    <span class="hl">DCONFAIL</span>     NOERR
vbond  198.51.100.30   198.51.100.30   biz-internet challenge  <span class="hl">CRTREJSER</span>    NOERR
vbond  198.51.100.30   198.51.100.30   biz-internet up         NOERR        NOERR</pre>
<p>Yeh history ek aise edge ko dikhati hai jo pehle reachability par fail hua, phir certificate check par, aur dono theek hone par aakhir mein up aaya. Aakhri do columns sabse kaam ke hain. Chapter 11 mukhya codes samjhata hai.</p>

<div class="eg"><p><b>Expected rows ginna.</b> E-DEL-1 ke do transports hain (biz-internet aur mpls) aur fabric mein ek Controller hai. Expected: do vsmart rows (har transport ke liye ek) aur ek vmanage row, sab up. Agar sirf ek vsmart row dikhe to doosre transport mein problem hai. Agar teen rows dikhein par ek connect kahe, to woh transport Controller tak nahi pahunch pa raha ya uski identity problem hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Healthy edge par vbond row ki ummeed rakhna; sirf ek transport down ho to edge ki jagah Controller dekhna; history ignore karke andaaza lagana; times compare karte waqt na dekhna ki devices ke clocks alag hain.</p></div>

<div class="exam"><p><b>Exam traps.</b> Controller up hone par edge Validator connection chhod deta hai. Do transports hone par bhi edge ek Manager connection banata hai. Connect mein atkna matlab reachability; challenge par atkna matlab identity. History local aur remote error codes dikhati hai.</p></div>

<div class="scn"><h4>Branch ka online aana</h4><p>Bengaluru ka naya router E-BLR-1 10:00 baje plug kiya gaya. 10:01 par use DHCP se address mila. 10:02 par history ne Validator ko DCONFAIL dikhaya, site ke firewall ko abhi control ports nahi diye gaye the. Network team ne unhe khola. 10:05 par history ne kuch second challenge aur phir up dikhaya. 10:06 tak Controller ne naya OMP peer list kiya aur BFD sessions ban rahe the. Branch controllers par bina kisi dakhal ke join ho gayi.</p><p><b>Seekh:</b> history kahani order mein batati hai. Upar se neeche padho.</p></div>

<div class="iv"><p class="q">"Batao jab naya edge boot hota hai to kya hota hai."</p><p>Strong answer: use VPN 0 mein IP aur default route milta hai, woh Validator se DTLS se connect hota hai aur certificate, organization name aur authorised list se authenticate hota hai. Validator use Controller aur Manager ke addresses aur uska NAT-mapped address batata hai, aur edge woh connection chhod deta hai. Woh Controller aur Manager se connect hota hai, OMP shuru hota hai, phir BFD tunnels bante hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: Validator, phir Controller aur Manager; Validator connection chhod diya jaata hai.</li>
<li>States: connect, handshake, challenge, up, tear_down.</li>
<li>Connect mein atka matlab network; baad mein atka matlab identity.</li>
<li>Har second hello, default roop se 12 second ke baad dead.</li>
<li>show sdwan control connections, local-properties aur connection-history use karo.</li>
</ul></div>
`}};export{e as default};