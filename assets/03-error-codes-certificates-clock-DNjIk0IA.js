var e={id:`error-codes-certificates-clock`,h:{en:`Layer 2 in depth: error codes, certificates, serial numbers and the clock`,hi:`Layer 2 gehrai mein: error codes, certificates, serial numbers aur clock`},body:{en:`
<p>When a car will not start, the dashboard light tells you where to look: battery, engine, oil. The control connection history is the dashboard of SD-WAN. Every failed attempt leaves a short code that says which door stayed shut. A beginner reboots the router; an engineer reads the code. This chapter teaches you to read the code, to check the three things that fail most often (certificate, serial number list, clock), and to check them from both ends.</p>

<h3>Where the codes live</h3>
<pre class="out">E-BLR-1# show sdwan control connection-history
PEER    PEER  PEER          SITE  DOMAIN  LOCAL         STATE      LOCAL ERROR  REMOTE ERROR  REPEAT
TYPE    PROT  SYSTEM IP     ID    ID      COLOR
vbond   dtls  -             0     0       biz-internet  tear_down  <span class="hl">CRTREJSER</span>    NOERR         4
vbond   dtls  -             0     0       biz-internet  connect    <span class="hl">DCONFAIL</span>     NOERR         12</pre>
<p><b>LOCAL ERROR</b> is the reason this device gave; <b>REMOTE ERROR</b> is what the peer told it; <b>REPEAT</b> counts how many times it happened. NOERR means no error on that side. Read the newest entry first and read both columns: if the remote error is not NOERR, the real problem is often on the controller side.</p>

<h3>The codes you will meet</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Error code families">
<rect x="10" y="20" width="190" height="150" rx="10" fill="#bae6fd"/><text x="105" y="46" text-anchor="middle" class="svg-ink" font-size="14">Path problems</text><text x="105" y="72" text-anchor="middle" class="svg-muted" font-size="12">DCONFAIL, DHSTMO</text><text x="105" y="90" text-anchor="middle" class="svg-muted" font-size="12">VB_TMO, VM_TMO, VS_TMO</text><text x="105" y="108" text-anchor="middle" class="svg-muted" font-size="12">NOACTVB</text><text x="105" y="140" text-anchor="middle" class="svg-accent" font-size="12">Look at underlay, firewall</text>
<rect x="225" y="20" width="190" height="150" rx="10" fill="#fde68a"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="14">Identity problems</text><text x="320" y="72" text-anchor="middle" class="svg-muted" font-size="12">CRTREJSER, CRTVERFL</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="12">CTORGNMMIS, CERTEXPRD</text><text x="320" y="108" text-anchor="middle" class="svg-muted" font-size="12">SERNTPRES, BIDNTVRFD</text><text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">Certificate, lists, clock</text>
<rect x="440" y="20" width="190" height="150" rx="10" fill="#fbcfe8"/><text x="535" y="46" text-anchor="middle" class="svg-ink" font-size="14">Configuration problems</text><text x="535" y="72" text-anchor="middle" class="svg-muted" font-size="12">DUPSER, DUPSYSIPDEL</text><text x="535" y="90" text-anchor="middle" class="svg-muted" font-size="12">SYSIPCHNG, NOVMCFG</text><text x="535" y="108" text-anchor="middle" class="svg-muted" font-size="12">DISTLOC, NOZTPEN</text><text x="535" y="140" text-anchor="middle" class="svg-accent" font-size="12">Duplicates, Manager config</text>
</svg><p class="cap">Three families: the path, the identity and the configuration.</p></div>
<table class="cmp"><tr><th>Code</th><th>Documented meaning</th><th>First check</th></tr>
<tr><td>DCONFAIL</td><td>DTLS connection failure</td><td>Underlay, UDP 12346 and hops, NAT</td></tr>
<tr><td>DHSTMO</td><td>DTLS handshake timeout</td><td>Path loss, MTU, firewall inspection</td></tr>
<tr><td>CRTREJSER</td><td>Challenge response rejected by peer</td><td>WAN edge list state, Send to Controllers, serial number</td></tr>
<tr><td>CRTVERFL</td><td>Failed to verify the peer certificate</td><td>Root certificate on both ends, clock</td></tr>
<tr><td>CTORGNMMIS</td><td>Certificate organisation name mismatch</td><td>Organisation name on every device</td></tr>
<tr><td>CERTEXPRD</td><td>Certificate expired</td><td>Validity dates (sdw-ops chapter 7), renew</td></tr>
<tr><td>SERNTPRES</td><td>Serial number not present</td><td>Is the device in the authorized list on the Controllers</td></tr>
<tr><td>BIDNTVRFD</td><td>Peer board-ID certificate not verified</td><td>Root certificate for the hardware ID</td></tr>
<tr><td>BDSGVERFL</td><td>Board ID signature verification failure</td><td>Device hardware identity; open a TAC case if the device is genuine</td></tr>
<tr><td>DUPSER</td><td>Duplicate serial number</td><td>Two devices claiming the same identity</td></tr>
<tr><td>DUPSYSIPDEL</td><td>Duplicate system IP</td><td>Two devices with the same system IP</td></tr>
<tr><td>SYSIPCHNG</td><td>System IP changed</td><td>Someone changed system-ip on the device</td></tr>
<tr><td>NOVMCFG</td><td>No configuration in the Manager for the device</td><td>Attach a template or configuration</td></tr>
<tr><td>NOACTVB</td><td>No active Validator found</td><td>Validator address and reachability</td></tr>
<tr><td>DISTLOC</td><td>TLOC disabled</td><td>Tunnel interface administratively shut or disabled</td></tr>
<tr><td>VB_TMO, VM_TMO, VS_TMO</td><td>Peer Validator, Manager or Controller timed out</td><td>Keepalives lost: path, controller load</td></tr>
<tr><td>RXTRDWN</td><td>Received teardown</td><td>The peer closed it on purpose; read the peer's side</td></tr></table>
<p>Cisco documents many more codes; the table lists the ones you will meet most. If a code is not here, look it up for your release rather than guessing its meaning. Note that earlier notes in this track sometimes shorten the organisation-name code; the documented name is CTORGNMMIS.</p>

<h3>The three usual suspects</h3>
<h4>1. The certificate</h4>
<pre class="code">E-BLR-1# show sdwan certificate installed
E-BLR-1# show sdwan certificate root-ca-cert | include Issuer
E-BLR-1# show sdwan certificate serial
E-BLR-1# show sdwan control local-properties | include certificate</pre>
<p>Check that a device certificate is installed, that it is valid for today's date, that the root certificate matches the one on the Controllers (the issuer line is a quick comparison), and that the serial number shown is the one in the authorized list.</p>
<h4>2. The authorized list</h4>
<p>The Controllers accept only devices they know. In the Manager open <b>Configuration &gt; Certificates</b> and check that the WAN edge is <b>Valid</b>, then use <b>Send to Controllers</b>. On the Controllers verify with <code>show control valid-vedges</code> (or <code>show orchestrator valid-vedges</code> on the Validator) that the serial number appears. A new device not in the list gives SERNTPRES or CRTREJSER.</p>
<h4>3. The clock</h4>
<pre class="code">E-BLR-1# show clock
E-BLR-1# show ntp associations
E-BLR-1# show sdwan control local-properties | include certificate-validity</pre>
<p>A certificate is valid between two dates. If the device believes it is January 2000 or 2035, a perfectly good certificate looks "not yet valid" or "expired", and the handshake fails with CRTVERFL. After a power loss, a hardware clock reset or an NTP server being blocked is a classic cause. Fix: allow NTP from VPN 0, set the clock manually for the first connection, and then let NTP take over.</p>

<h3>Checking both ends</h3>
<p>Whenever the edge side shows CRTREJSER, look at the Controller. On the vSmart or Validator, <code>show control connections-history</code> (or the equivalent on your release) shows the same attempt from the other side, often with a clearer remote error. This is the habit to build: <b>read the same event from both ends</b>.</p>

<h3>Safe restart of a connection</h3>
<p>After you fix the cause, the edge retries by itself. If you want to speed up, you may clear the control connection on the edge with <code>clear sdwan control connections</code>, but do it only when you know why the connection failed and have another way in, because it drops the connection for a moment. Never clear connections as the first step.</p>

<div class="eg"><p><b>Worked example.</b> The history of E-HYD-1 (site 400) shows <code>CRTREJSER</code> locally and <code>NOERR</code> remotely, repeated 4 times. <code>show sdwan certificate serial</code> prints serial 11A2B3C4. In the Manager the WAN Edge List shows this serial as Invalid, the status somebody set during a hardware swap. The engineer changes it to Valid and clicks Send to Controllers. Two minutes later the history stops growing and the control connection is up. Total: three commands, two clicks, no reboot.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Reading only LOCAL ERROR. (2) Replacing the certificate when the problem is the authorized list. (3) Forgetting that the clock is part of certificate validation. (4) Clearing connections repeatedly and making the history harder to read. (5) Guessing a code's meaning instead of looking it up.</p></div>

<div class="exam"><p><b>Exam trap.</b> CRTREJSER means the peer rejected the challenge response; DCONFAIL is a DTLS connection failure; CTORGNMMIS is organisation name mismatch; SERNTPRES means serial number not present. Know which belong to the path, the identity and the configuration.</p></div>

<div class="scn"><h4>After the power cut</h4><p>A store in Chennai had a power cut. When the power returned, the edge came up but never joined. The history said CRTVERFL. The clock read the year 2000. NTP was blocked by a new firewall rule. The engineer set the clock, the connection came up, and the firewall was changed to allow NTP from the edge's transport address.</p><p><b>Lesson:</b> an expired-looking certificate is often a wrong clock.</p></div>

<div class="iv"><p class="q">"You see CRTREJSER on a new edge. What do you do?"</p><p>CRTREJSER means the peer rejected the challenge. I confirm the serial number with <code>show sdwan certificate serial</code>, check the WAN Edge List state in Configuration &gt; Certificates, set it to Valid if needed and use Send to Controllers, check <code>valid-vedges</code> on the controller, and verify the organisation name and the clock. I also read the same event on the controller side.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>connection-history gives local and remote error codes and a repeat count.</li>
<li>Codes fall into path, identity and configuration families.</li>
<li>Check certificate, authorized list and clock, in that spirit, on both ends.</li>
<li>Use Send to Controllers after changing the WAN edge list.</li>
<li>Look up unknown codes; do not guess.</li>
</ul></div>
`,hi:`
<p>Gaadi start na ho to dashboard ki light batati hai kahan dekhna hai: battery, engine, oil. Control connection history SD-WAN ka dashboard hai. Har failed attempt ek chhota code chhodta hai jo batata hai kaunsa darwaza band raha. Beginner router reboot karta hai; engineer code padhta hai. Yeh chapter code padhna sikhata hai, un teen cheezon ko check karna jo sabse zyada fail hoti hain (certificate, serial number list, clock), aur dono ends se check karna.</p>

<h3>Codes kahan milte hain</h3>
<pre class="out">E-BLR-1# show sdwan control connection-history
PEER    PEER  PEER          SITE  DOMAIN  LOCAL         STATE      LOCAL ERROR  REMOTE ERROR  REPEAT
TYPE    PROT  SYSTEM IP     ID    ID      COLOR
vbond   dtls  -             0     0       biz-internet  tear_down  <span class="hl">CRTREJSER</span>    NOERR         4
vbond   dtls  -             0     0       biz-internet  connect    <span class="hl">DCONFAIL</span>     NOERR         12</pre>
<p><b>LOCAL ERROR</b> woh wajah hai jo is device ne di; <b>REMOTE ERROR</b> woh hai jo peer ne bataya; <b>REPEAT</b> gintii hai ki kitni baar hua. NOERR matlab us side par koi error nahi. Sabse naya entry pehle padho aur dono columns padho: agar remote error NOERR nahi hai to asli problem aksar controller side par hoti hai.</p>

<h3>Jo codes aap dekhoge</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Error code families">
<rect x="10" y="20" width="190" height="150" rx="10" fill="#bae6fd"/><text x="105" y="46" text-anchor="middle" class="svg-ink" font-size="14">Path problems</text><text x="105" y="72" text-anchor="middle" class="svg-muted" font-size="12">DCONFAIL, DHSTMO</text><text x="105" y="90" text-anchor="middle" class="svg-muted" font-size="12">VB_TMO, VM_TMO, VS_TMO</text><text x="105" y="108" text-anchor="middle" class="svg-muted" font-size="12">NOACTVB</text><text x="105" y="140" text-anchor="middle" class="svg-accent" font-size="12">Underlay, firewall dekho</text>
<rect x="225" y="20" width="190" height="150" rx="10" fill="#fde68a"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="14">Identity problems</text><text x="320" y="72" text-anchor="middle" class="svg-muted" font-size="12">CRTREJSER, CRTVERFL</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="12">CTORGNMMIS, CERTEXPRD</text><text x="320" y="108" text-anchor="middle" class="svg-muted" font-size="12">SERNTPRES, BIDNTVRFD</text><text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">Certificate, lists, clock</text>
<rect x="440" y="20" width="190" height="150" rx="10" fill="#fbcfe8"/><text x="535" y="46" text-anchor="middle" class="svg-ink" font-size="14">Configuration problems</text><text x="535" y="72" text-anchor="middle" class="svg-muted" font-size="12">DUPSER, DUPSYSIPDEL</text><text x="535" y="90" text-anchor="middle" class="svg-muted" font-size="12">SYSIPCHNG, NOVMCFG</text><text x="535" y="108" text-anchor="middle" class="svg-muted" font-size="12">DISTLOC, NOZTPEN</text><text x="535" y="140" text-anchor="middle" class="svg-accent" font-size="12">Duplicates, Manager config</text>
</svg><p class="cap">Teen families: path, identity aur configuration.</p></div>
<table class="cmp"><tr><th>Code</th><th>Documented matlab</th><th>Pehla check</th></tr>
<tr><td>DCONFAIL</td><td>DTLS connection failure</td><td>Underlay, UDP 12346 aur hops, NAT</td></tr>
<tr><td>DHSTMO</td><td>DTLS handshake timeout</td><td>Path loss, MTU, firewall inspection</td></tr>
<tr><td>CRTREJSER</td><td>Challenge response peer ne reject kiya</td><td>WAN edge list state, Send to Controllers, serial number</td></tr>
<tr><td>CRTVERFL</td><td>Peer certificate verify nahi hua</td><td>Dono ends par root certificate, clock</td></tr>
<tr><td>CTORGNMMIS</td><td>Certificate organisation name mismatch</td><td>Har device par organisation name</td></tr>
<tr><td>CERTEXPRD</td><td>Certificate expired</td><td>Validity dates (sdw-ops chapter 7), renew</td></tr>
<tr><td>SERNTPRES</td><td>Serial number maujood nahi</td><td>Kya device Controllers ki authorized list mein hai</td></tr>
<tr><td>BIDNTVRFD</td><td>Peer board-ID certificate verify nahi hua</td><td>Hardware ID ka root certificate</td></tr>
<tr><td>BDSGVERFL</td><td>Board ID signature verification failure</td><td>Device hardware identity; device asli ho to TAC case</td></tr>
<tr><td>DUPSER</td><td>Duplicate serial number</td><td>Do devices ek hi identity claim kar rahe</td></tr>
<tr><td>DUPSYSIPDEL</td><td>Duplicate system IP</td><td>Do devices ka same system IP</td></tr>
<tr><td>SYSIPCHNG</td><td>System IP badla</td><td>Kisi ne device par system-ip badla</td></tr>
<tr><td>NOVMCFG</td><td>Device ke liye Manager mein configuration nahi</td><td>Template ya configuration attach karo</td></tr>
<tr><td>NOACTVB</td><td>Koi active Validator nahi mila</td><td>Validator address aur reachability</td></tr>
<tr><td>DISTLOC</td><td>TLOC disabled</td><td>Tunnel interface administratively shut ya disabled</td></tr>
<tr><td>VB_TMO, VM_TMO, VS_TMO</td><td>Peer Validator, Manager ya Controller timeout</td><td>Keepalives gaye: path, controller load</td></tr>
<tr><td>RXTRDWN</td><td>Teardown mila</td><td>Peer ne jaanbujhkar band kiya; peer ki side padho</td></tr></table>
<p>Cisco aur bhi bahut codes document karta hai; table woh deti hai jo aap sabse zyada dekhoge. Agar code yahan nahi hai to guess mat karo, apne release ke liye dekho. Dhyan do ki is track ke pichhle notes kabhi-kabhi organisation-name code ko chhota likhte hain; documented naam CTORGNMMIS hai.</p>

<h3>Teen aam shak</h3>
<h4>1. Certificate</h4>
<pre class="code">E-BLR-1# show sdwan certificate installed
E-BLR-1# show sdwan certificate root-ca-cert | include Issuer
E-BLR-1# show sdwan certificate serial
E-BLR-1# show sdwan control local-properties | include certificate</pre>
<p>Check karo ki device certificate installed hai, aaj ki tareekh ke liye valid hai, root certificate Controllers wale se match karta hai (issuer line tez comparison hai), aur dikhaya gaya serial number authorized list wala hai.</p>
<h4>2. Authorized list</h4>
<p>Controllers sirf jaane-pehchane devices ko accept karte hain. Manager mein <b>Configuration &gt; Certificates</b> kholo aur dekho WAN edge <b>Valid</b> hai, phir <b>Send to Controllers</b> use karo. Controllers par <code>show control valid-vedges</code> (ya Validator par <code>show orchestrator valid-vedges</code>) se verify karo ki serial number dikh raha hai. List mein na hone wala naya device SERNTPRES ya CRTREJSER deta hai.</p>
<h4>3. Clock</h4>
<pre class="code">E-BLR-1# show clock
E-BLR-1# show ntp associations
E-BLR-1# show sdwan control local-properties | include certificate-validity</pre>
<p>Certificate do tareekhon ke beech valid hota hai. Agar device ko lagta hai ki Jan 2000 ya 2035 hai to bilkul theek certificate "abhi valid nahi" ya "expired" dikhta hai, aur handshake CRTVERFL ke saath fail hota hai. Power loss ke baad hardware clock reset ya NTP server ka block hona classic wajah hai. Fix: VPN 0 se NTP allow karo, pehle connection ke liye clock haath se set karo, phir NTP sambhaal lega.</p>

<h3>Dono ends check karna</h3>
<p>Jab edge side CRTREJSER dikhaye, controller dekho. vSmart ya Validator par <code>show control connections-history</code> (ya aapke release ka equivalent) wahi attempt doosri taraf se dikhata hai, aksar saaf remote error ke saath. Yeh aadat banao: <b>wahi event dono ends se padho</b>.</p>

<h3>Connection ko safely restart karna</h3>
<p>Wajah theek karne ke baad edge khud retry karta hai. Tez karna ho to edge par <code>clear sdwan control connections</code> kar sakte ho, lekin tabhi jab pata ho connection kyun fail hua aur aapke paas andar aane ka doosra raasta ho, kyunki yeh pal bhar ke liye connection girata hai. Pehle step ke roop mein kabhi connections clear mat karo.</p>

<div class="eg"><p><b>Worked example.</b> E-HYD-1 (site 400) ki history locally <code>CRTREJSER</code> aur remotely <code>NOERR</code> dikhati hai, 4 baar. <code>show sdwan certificate serial</code> serial 11A2B3C4 dikhata hai. Manager mein WAN Edge List mein yeh serial Invalid hai, jo hardware swap ke dauran kisi ne set kiya tha. Engineer ise Valid karta hai aur Send to Controllers dabata hai. Do minute baad history badhna band ho jaati hai aur control connection up hai. Total: teen commands, do clicks, reboot nahi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Sirf LOCAL ERROR padhna. (2) Jab problem authorized list hai tab certificate badalna. (3) Yeh bhoolna ki clock certificate validation ka hissa hai. (4) Baar-baar connections clear karke history padhna mushkil karna. (5) Code ka matlab dekhne ki jagah guess karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> CRTREJSER matlab peer ne challenge response reject kiya; DCONFAIL DTLS connection failure hai; CTORGNMMIS organisation name mismatch hai; SERNTPRES matlab serial number maujood nahi. Jaano kaunse path, identity aur configuration ke hain.</p></div>

<div class="scn"><h4>Power cut ke baad</h4><p>Chennai ke ek store mein power cut hua. Power wapas aane par edge up hua lekin join nahi hua. History ne CRTVERFL kaha. Clock saal 2000 dikha raha tha. Naye firewall rule ne NTP block kiya tha. Engineer ne clock set kiya, connection up hua, aur firewall edge ke transport address se NTP allow karne ke liye badla gaya.</p><p><b>Lesson:</b> expired dikhne wala certificate aksar galat clock hota hai.</p></div>

<div class="iv"><p class="q">"Naye edge par CRTREJSER dikhta hai. Kya karoge?"</p><p>CRTREJSER matlab peer ne challenge reject kiya. Main <code>show sdwan certificate serial</code> se serial confirm karta hoon, Configuration &gt; Certificates mein WAN Edge List state dekhta hoon, zaroorat ho to Valid karke Send to Controllers karta hoon, controller par <code>valid-vedges</code> check karta hoon, aur organisation name aur clock verify karta hoon. Wahi event controller side par bhi padhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>connection-history local aur remote error codes aur repeat count deti hai.</li>
<li>Codes path, identity aur configuration families mein aate hain.</li>
<li>Certificate, authorized list aur clock, dono ends par check karo.</li>
<li>WAN edge list badalne ke baad Send to Controllers use karo.</li>
<li>Anjaan codes dekho; guess mat karo.</li>
</ul></div>
`}};export{e as default};