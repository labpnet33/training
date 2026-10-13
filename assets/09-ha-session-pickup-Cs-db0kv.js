var e={id:`ha-session-pickup`,h:{en:`Session pickup: keeping connections alive`,hi:`Session pickup: connections ko zinda rakhna`},body:{en:`
<p>When a call centre agent's headset dies, a colleague can take the next call. But if the colleague also sees the notes of the call in progress, the customer never has to start again. Failover without session pickup is the first case: traffic flows again, but every established connection is gone. <b>Session pickup</b> is the second: the primary keeps copying its session table to the secondary. This chapter covers lab <b>n7-ha-session</b>.</p>

<h3>What a failover does to sessions</h3>
<p>A FortiGate firewall is stateful: it remembers every connection in a session table. After a failover the new primary has the same MAC and IP identity, but if it never saw the sessions, the next packet of an old TCP connection looks like an unknown mid-stream packet and is dropped, and the user sees a reset or a hung download. New connections work at once. With session pickup the new primary already knows the old ones, so a SSH or file transfer simply continues, perhaps after a short pause.</p>

<h3>The settings</h3>
<dl class="terms">
<dt>session-pickup enable</dt><dd>Copies <b>established TCP</b> sessions from the primary to the secondary. Default is disable.</dd>
<dt>session-pickup-connectionless</dt><dd>Adds <b>UDP and ICMP</b> sessions (DNS, VoIP media, ping). Needs session-pickup enabled.</dd>
<dt>session-pickup-delay enable</dt><dd>Copies only sessions older than about 30 seconds. Short-lived sessions (most web requests) are never copied, which saves CPU and heartbeat bandwidth.</dd>
<dt>session-pickup-expectation</dt><dd>Also copies expectation sessions, the helper sessions that protocols like SIP or FTP open dynamically. The simulator accepts it but does not model it.</dd>
</dl>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Session pickup before and after failover">
<rect x="30" y="30" width="170" height="80" rx="10" fill="#bae6fd"/><text x="115" y="56" text-anchor="middle" class="svg-ink" font-size="14">FGT-A primary</text><text x="115" y="78" text-anchor="middle" class="svg-muted" font-size="12">session table</text><text x="115" y="96" text-anchor="middle" class="svg-muted" font-size="12">10.10.1.10 to 8.8.8.8:80</text>
<rect x="440" y="30" width="170" height="80" rx="10" fill="#ddd6fe"/><text x="525" y="56" text-anchor="middle" class="svg-ink" font-size="14">FGT-B secondary</text><text x="525" y="78" text-anchor="middle" class="svg-muted" font-size="12">copy, flag synced</text><text x="525" y="96" text-anchor="middle" class="svg-muted" font-size="12">state=may_dirty</text>
<line x1="200" y1="70" x2="440" y2="70" stroke="#64748b" stroke-width="4"/><polygon points="440,70 428,63 428,77" fill="#64748b"/><text x="320" y="62" text-anchor="middle" class="svg-accent" font-size="12">heartbeat link: session sync</text>
<text x="320" y="95" text-anchor="middle" class="svg-muted" font-size="12">TCP only unless connectionless</text>
<rect x="30" y="140" width="170" height="60" rx="10" fill="#e2e8f0"/><text x="115" y="166" text-anchor="middle" class="svg-ink" font-size="13">after failover</text><text x="115" y="184" text-anchor="middle" class="svg-muted" font-size="12">holds copies, flag synced</text>
<rect x="440" y="140" width="170" height="60" rx="10" fill="#bbf7d0"/><text x="525" y="166" text-anchor="middle" class="svg-ink" font-size="13">now primary</text><text x="525" y="184" text-anchor="middle" class="svg-muted" font-size="12">owns sessions, flag gone</text>
</svg><p class="cap">The secondary stores copies; at failover it becomes the owner and the old primary keeps copies in turn.</p></div>

<h3>Lab 4 step by step</h3>
<p><b>1 Baseline.</b> Session pickup is off. From PC-LAN run <code>curl 8.8.8.8</code> and <code>ping 8.8.8.8</code>. On FGT-B the session list is empty.</p>
<pre class="out">FGT-B # diagnose sys session list
<span class="hl">total session 0</span></pre>
<p><b>2 Enable on the primary.</b> It synchronises to FGT-B.</p>
<pre class="code">config system ha
    set session-pickup enable
end</pre>
<p>Repeat curl and ping. Only the TCP session appears on FGT-B, flagged <code>synced</code>. The ICMP echo is not copied because connectionless pickup is still off.</p>
<pre class="out">FGT-B # diagnose sys session list
session info: proto=<span class="hl">6</span> proto_state=01 duration=11 expire=3589 timeout=3600 flags=00000000 socktype=0 sockport=0 av_idx=0 use=3
state=may_dirty <span class="hl">synced</span>
statistic(bytes/packets/allow_err): org=300/3/1 reply=300/2/1 tuples=2
hook=post dir=org act=snat 10.10.1.10:64251-&gt;8.8.8.8:80(198.51.100.2:60002)
total session 1</pre>
<p><b>3 Controlled failover.</b> The auditor's test: take the primary out of service on purpose.</p>
<pre class="code">execute ha failover set 1
<span class="c">! check on FGT-B: now primary, session without the synced flag</span>
get system ha status
diagnose sys session list
<span class="c">! then release the flag</span>
execute ha failover unset 1</pre>
<p>FGT-B is primary, the TCP session to 8.8.8.8 port 80 is still there, and PC-LAN can ping. Because <code>failover set</code> reset the age of FGT-A, it does not take the role back after <code>unset</code> (chapter 7).</p>
<p><b>4 Connectionless.</b> The roles are swapped, so type the setting on the <b>current primary FGT-B</b>; it synchronises to FGT-A.</p>
<pre class="code">config system ha
    set session-pickup-connectionless enable
end</pre>
<p>Ping again from PC-LAN and read the sessions on FGT-A: a <code>proto=1</code> entry flagged synced appears. ICMP sessions are short, so look immediately after the ping.</p>

<h3>What does not survive</h3>
<p>Session pickup copies the session table, not everything a session depends on. Sessions that rely on deeper state, such as those inspected by proxy-based security profiles or SSL deep inspection (see the web proxy and UTM module), are not synchronised in real FortiOS; those connections restart after failover. IPsec tunnels and sessions offloaded to hardware have their own rules; check the documentation for your model and version. Both units also need the <b>same policies</b> (chapter 8) or the copied session has nothing to match.</p>
<p>Session sync has a price: more heartbeat traffic and CPU on a busy firewall. That is the reason for <code>session-pickup-delay</code>. In the lab the simulator is a subset: it copies TCP and connectionless sessions only, with no ALG helpers and no proxy-based inspection.</p>

<div class="warn"><p><b>Common mistake.</b> Testing with a ping and concluding "pickup works" or "pickup is broken". ICMP and UDP are not copied unless connectionless is on; test with a long TCP session, such as SSH or a download.</p></div>

<div class="exam"><p><b>Exam trap.</b> Session pickup is off by default and covers TCP only. UDP and ICMP need <code>session-pickup-connectionless</code>; very short sessions are skipped with <code>session-pickup-delay</code>.</p></div>

<div class="scn"><h4>The failover test that dropped the VoIP calls</h4><p>After a planned failover, web downloads continued, yet every IP phone call dropped for a few seconds. Session pickup was on, but the voice media is UDP and connectionless was off. Enabling <code>session-pickup-connectionless</code> on the primary let the next failover keep the media flows. The team also confirmed that the same policy existed on both units.</p><p><b>Lesson:</b> check which protocols your users need, not only that "session pickup is enabled".</p></div>

<div class="iv"><p class="q">"What happens to users when the primary fails and session pickup is off?"</p><p>New sessions work immediately; established ones break and must be re-opened, because the new primary has no state for them. Then describe the fix: enable session-pickup, add connectionless for UDP and ICMP, consider the delay option, and mention the cost and the exceptions such as proxy-based inspection.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Without session pickup a failover drops every established connection.</li>
<li>session-pickup copies established TCP; connectionless adds UDP and ICMP.</li>
<li>The secondary lists copies with state=may_dirty synced; after failover the flag is gone.</li>
<li>session-pickup-delay skips short sessions to save resources.</li>
<li>Proxy-based and deep-inspected sessions are not synchronised; both units need identical policies.</li>
</ul></div>
`,hi:`
<p>Call centre agent ka headset kharab ho jaaye to colleague agla call le sakta hai. Par agar colleague ko chalte hue call ke notes bhi dikhein, to customer ko dobara shuru nahi karna padta. Session pickup ke bina failover pehla case hai: traffic phir chalta hai, par har established connection chala jaata hai. <b>Session pickup</b> doosra case hai: primary apni session table secondary ko copy karta rehta hai. Yeh chapter lab <b>n7-ha-session</b> cover karta hai.</p>

<h3>Failover sessions ke saath kya karta hai</h3>
<p>FortiGate firewall stateful hai: woh har connection session table mein yaad rakhta hai. Failover ke baad naye primary ke paas wahi MAC aur IP identity hoti hai, par agar usne sessions kabhi dekhe hi nahi, to purane TCP connection ka agla packet use unknown mid-stream packet lagta hai aur drop ho jaata hai, aur user ko reset ya atka hua download dikhta hai. Naye connections turant kaam karte hain. Session pickup ke saath naya primary purane sessions pehle se jaanta hai, isliye SSH ya file transfer bas chalta rehta hai, shayad chhote pause ke baad.</p>

<h3>Settings</h3>
<dl class="terms">
<dt>session-pickup enable</dt><dd>Primary se secondary ko <b>established TCP</b> sessions copy karta hai. Default disable hai.</dd>
<dt>session-pickup-connectionless</dt><dd><b>UDP aur ICMP</b> sessions jodta hai (DNS, VoIP media, ping). Iske liye session-pickup enabled hona chahiye.</dd>
<dt>session-pickup-delay enable</dt><dd>Sirf lagbhag 30 second se purane sessions copy karta hai. Chhote sessions (zyadatar web requests) kabhi copy nahi hote, jisse CPU aur heartbeat bandwidth bachti hai.</dd>
<dt>session-pickup-expectation</dt><dd>Expectation sessions bhi copy karta hai, yaani woh helper sessions jo SIP ya FTP jaise protocols dynamically kholte hain. Simulator ise accept karta hai par model nahi karta.</dd>
</dl>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Failover se pehle aur baad session pickup">
<rect x="30" y="30" width="170" height="80" rx="10" fill="#bae6fd"/><text x="115" y="56" text-anchor="middle" class="svg-ink" font-size="14">FGT-A primary</text><text x="115" y="78" text-anchor="middle" class="svg-muted" font-size="12">session table</text><text x="115" y="96" text-anchor="middle" class="svg-muted" font-size="12">10.10.1.10 to 8.8.8.8:80</text>
<rect x="440" y="30" width="170" height="80" rx="10" fill="#ddd6fe"/><text x="525" y="56" text-anchor="middle" class="svg-ink" font-size="14">FGT-B secondary</text><text x="525" y="78" text-anchor="middle" class="svg-muted" font-size="12">copy, flag synced</text><text x="525" y="96" text-anchor="middle" class="svg-muted" font-size="12">state=may_dirty</text>
<line x1="200" y1="70" x2="440" y2="70" stroke="#64748b" stroke-width="4"/><polygon points="440,70 428,63 428,77" fill="#64748b"/><text x="320" y="62" text-anchor="middle" class="svg-accent" font-size="12">heartbeat link: session sync</text>
<text x="320" y="95" text-anchor="middle" class="svg-muted" font-size="12">sirf TCP, jab tak connectionless na ho</text>
<rect x="30" y="140" width="170" height="60" rx="10" fill="#e2e8f0"/><text x="115" y="166" text-anchor="middle" class="svg-ink" font-size="13">failover ke baad</text><text x="115" y="184" text-anchor="middle" class="svg-muted" font-size="12">copies, flag synced</text>
<rect x="440" y="140" width="170" height="60" rx="10" fill="#bbf7d0"/><text x="525" y="166" text-anchor="middle" class="svg-ink" font-size="13">ab primary</text><text x="525" y="184" text-anchor="middle" class="svg-muted" font-size="12">sessions ka owner, flag gaya</text>
</svg><p class="cap">Secondary copies rakhta hai; failover par woh owner ban jaata hai aur purana primary badle mein copies rakhta hai.</p></div>

<h3>Lab 4 step by step</h3>
<p><b>1 Baseline.</b> Session pickup off hai. PC-LAN se <code>curl 8.8.8.8</code> aur <code>ping 8.8.8.8</code> chalao. FGT-B par session list khaali hai.</p>
<pre class="out">FGT-B # diagnose sys session list
<span class="hl">total session 0</span></pre>
<p><b>2 Primary par enable.</b> Yeh FGT-B tak synchronise hota hai.</p>
<pre class="code">config system ha
    set session-pickup enable
end</pre>
<p>Curl aur ping dobara chalao. FGT-B par sirf TCP session dikhta hai, <code>synced</code> flag ke saath. ICMP echo copy nahi hota kyunki connectionless pickup abhi off hai.</p>
<pre class="out">FGT-B # diagnose sys session list
session info: proto=<span class="hl">6</span> proto_state=01 duration=11 expire=3589 timeout=3600 flags=00000000 socktype=0 sockport=0 av_idx=0 use=3
state=may_dirty <span class="hl">synced</span>
statistic(bytes/packets/allow_err): org=300/3/1 reply=300/2/1 tuples=2
hook=post dir=org act=snat 10.10.1.10:64251-&gt;8.8.8.8:80(198.51.100.2:60002)
total session 1</pre>
<p><b>3 Controlled failover.</b> Auditor ka test: primary ko jaan-boojh kar service se hatao.</p>
<pre class="code">execute ha failover set 1
<span class="c">! FGT-B par check karo: ab primary, session synced flag ke bina</span>
get system ha status
diagnose sys session list
<span class="c">! phir flag release karo</span>
execute ha failover unset 1</pre>
<p>FGT-B primary hai, 8.8.8.8 port 80 ka TCP session abhi bhi maujood hai, aur PC-LAN ping kar sakta hai. <code>failover set</code> ne FGT-A ki age reset ki thi, isliye <code>unset</code> ke baad woh role wapas nahi leta (chapter 7).</p>
<p><b>4 Connectionless.</b> Roles swap ho gaye, isliye setting <b>current primary FGT-B</b> par type karo; woh FGT-A tak synchronise hoti hai.</p>
<pre class="code">config system ha
    set session-pickup-connectionless enable
end</pre>
<p>PC-LAN se phir ping karo aur FGT-A par sessions padho: synced flag wali <code>proto=1</code> entry dikhti hai. ICMP sessions chhote hote hain, isliye ping ke turant baad dekho.</p>

<h3>Kya nahi bachta</h3>
<p>Session pickup session table copy karta hai, har wo cheez nahi jispar session depend karta hai. Jo sessions deeper state par chalte hain, jaise proxy-based security profiles ya SSL deep inspection (web proxy aur UTM module dekho), woh real FortiOS mein synchronise nahi hote; unke connections failover ke baad restart hote hain. IPsec tunnels aur hardware par offload hue sessions ke apne rules hain; apne model aur version ka documentation dekho. Dono units par <b>same policies</b> bhi chahiye (chapter 8), warna copy kiye session ke paas match karne ko kuch nahi hota.</p>
<p>Session sync ki qeemat hai: zyada heartbeat traffic aur busy firewall par CPU. Isiliye <code>session-pickup-delay</code> hai. Lab mein simulator ek subset hai: woh sirf TCP aur connectionless sessions copy karta hai, ALG helpers aur proxy-based inspection ke bina.</p>

<div class="warn"><p><b>Common mistake.</b> Sirf ping se test karke "pickup chal raha hai" ya "pickup kharab hai" kehna. ICMP aur UDP tab tak copy nahi hote jab tak connectionless on na ho; lambe TCP session, jaise SSH ya download, se test karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Session pickup default mein off hai aur sirf TCP cover karta hai. UDP aur ICMP ke liye <code>session-pickup-connectionless</code> chahiye; bahut chhote sessions <code>session-pickup-delay</code> se skip hote hain.</p></div>

<div class="scn"><h4>Failover test jisne VoIP calls gira diye</h4><p>Planned failover ke baad web downloads chalte rahe, par har IP phone call kuch second ke liye gir gayi. Session pickup on tha, par voice media UDP hai aur connectionless off tha. Primary par <code>session-pickup-connectionless</code> enable karne se agle failover mein media flows bach gaye. Team ne yeh bhi confirm kiya ki dono units par same policy thi.</p><p><b>Lesson:</b> dekho users ko kaunse protocols chahiye, sirf yeh nahi ki "session pickup enabled hai".</p></div>

<div class="iv"><p class="q">"Primary fail ho aur session pickup off ho to users ke saath kya hota hai?"</p><p>Naye sessions turant kaam karte hain; established sessions toot jaate hain aur dobara kholne padte hain, kyunki naye primary ke paas unki state nahi hoti. Phir fix batao: session-pickup enable, UDP aur ICMP ke liye connectionless, delay option par vichar, aur cost tatha exceptions jaise proxy-based inspection ka zikr.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Session pickup ke bina failover har established connection girata hai.</li>
<li>session-pickup established TCP copy karta hai; connectionless UDP aur ICMP jodta hai.</li>
<li>Secondary copies ko state=may_dirty synced ke saath list karta hai; failover ke baad flag chala jaata hai.</li>
<li>session-pickup-delay chhote sessions skip karke resources bachata hai.</li>
<li>Proxy-based aur deep-inspected sessions synchronise nahi hote; dono units par identical policies chahiye.</li>
</ul></div>
`}};export{e as default};