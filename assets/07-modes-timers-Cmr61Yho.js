var e={id:`modes-timers`,h:{en:`Supplicant modes, timers, reauthentication and IP phones`,hi:`Supplicant modes, timers, reauthentication aur IP phones`},body:{en:`
<p>A port is not always one host. A trainee shares a desk switch, a phone sits in front of a PC, a hub joins two laptops. The <b>supplicant mode</b> tells the EX how many hosts the port may serve and how each is authenticated.</p>

<h3>The three modes</h3>
<table class="cmp"><tr><th>Mode</th><th>Authenticates</th><th>Other hosts on the port</th><th>Use</th></tr>
<tr><td><code>single</code> (default)</td><td>the first host</td><td>pass after the first host succeeds, without their own login</td><td>convenient, weakest</td></tr>
<tr><td><code>single-secure</code></td><td>the first host</td><td><b>blocked</b></td><td>one device per jack: strictest</td></tr>
<tr><td><code>multiple</code></td><td><b>every</b> host, separately</td><td>each needs its own success</td><td>desk switches, hubs, phone + PC</td></tr></table>
<pre class="code">set protocols dot1x authenticator interface ge-0/0/4 supplicant multiple</pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Supplicant modes">
<rect x="20" y="20" width="180" height="150" rx="12" fill="#e2e8f0"/><text x="110" y="42" text-anchor="middle" class="svg-ink" font-size="13">single</text>
<text x="110" y="75" text-anchor="middle" class="svg-muted" font-size="11">host A logs in</text><text x="110" y="95" text-anchor="middle" class="svg-muted" font-size="11">host B rides along</text><text x="110" y="125" text-anchor="middle" class="svg-accent" font-size="12">B has no login</text>
<rect x="230" y="20" width="180" height="150" rx="12" fill="#fde68a"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">single-secure</text>
<text x="320" y="75" text-anchor="middle" class="svg-muted" font-size="11">host A logs in</text><text x="320" y="95" text-anchor="middle" class="svg-muted" font-size="11">host B is blocked</text><text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="12">one device per port</text>
<rect x="440" y="20" width="180" height="150" rx="12" fill="#bbf7d0"/><text x="530" y="42" text-anchor="middle" class="svg-ink" font-size="13">multiple</text>
<text x="530" y="75" text-anchor="middle" class="svg-muted" font-size="11">host A logs in</text><text x="530" y="95" text-anchor="middle" class="svg-muted" font-size="11">host B logs in too</text><text x="530" y="125" text-anchor="middle" class="svg-accent" font-size="12">own result each</text>
</svg><p class="cap">Pick the mode from what really sits behind the jack.</p></div>

<h3>Real output: two trainees behind a desk switch</h3>
<p>Lab 3: with single-secure only trainee1 got in. After <code>supplicant multiple</code> on ge-0/0/4 both authenticate separately:</p>
<pre class="out">lab@SUPSW&gt; show dot1x interface
802.1X Information:
Interface     Role           State           MAC address          User
ge-0/0/1.0    Authenticator  Authenticated   00:50:68:99:b4:01    help1
ge-0/0/4.0    Authenticator  Authenticated   00:50:46:58:ed:01    trainee1
ge-0/0/4.0    Authenticator  Authenticated   00:50:45:58:ec:01    trainee2

lab@SUPSW&gt; show dot1x interface ge-0/0/4 detail
  Supplicant mode:                      <span class="hl">Multiple</span>
  Number of connected supplicants:      2
    Supplicant: trainee1, 00:50:46:58:ed:01
      Operational state:                Authenticated
    Supplicant: trainee2, 00:50:45:58:ec:01
      Operational state:                Authenticated</pre>
<p>Both trainees appear on the same interface, each with their own MAC and user. Each user can have a different VLAN from RADIUS, but they share the port, so on many platforms the VLAN of the first host applies to the whole port. Check your release before promising per-host VLANs.</p>

<h3>The timers</h3>
<table class="cmp"><tr><th>Statement</th><th>Default</th><th>Meaning</th></tr>
<tr><td><code>transmit-period</code></td><td>30 s</td><td>gap between EAP-Request/Identity frames to a silent host</td></tr>
<tr><td><code>maximum-requests</code></td><td>2</td><td>frames sent before giving up on 802.1X</td></tr>
<tr><td><code>quiet-period</code></td><td>60 s</td><td>hold time after a failed attempt</td></tr>
<tr><td><code>supplicant-timeout</code></td><td>30 s</td><td>wait for a supplicant's reply to a challenge</td></tr>
<tr><td><code>server-timeout</code></td><td>30 s</td><td>wait for RADIUS to answer</td></tr>
<tr><td><code>retries</code></td><td>3</td><td>attempts before the quiet period</td></tr>
<tr><td><code>reauthentication</code></td><td>3600 s</td><td>how often an authorised host is checked again</td></tr></table>
<p>These defaults appear in the <code>show dot1x interface ... detail</code> output. Faster fallback: lower <code>transmit-period</code> (for example 10) so the guest VLAN or MAC RADIUS arrives in 20 seconds instead of 60, at the price of a few more frames.</p>

<h3>Reauthentication</h3>
<p>Every authorised host is re-checked at the reauthentication interval. It is how a changed password, a deleted user, or a changed VLAN assignment reaches the port without anybody unplugging. A short interval gives faster policy updates, but more RADIUS load, and (with server-fail deny) more exposure to a RADIUS outage. A typical choice is 1 to 8 hours.</p>

<h3>IP phones and 802.1X</h3>
<p>A phone with a PC behind it is two devices on one port. Typical designs: (1) phone with its own supplicant or certificate plus PC with its own, port in <code>supplicant multiple</code>; (2) phone authenticated by MAC RADIUS (<code>mac-radius</code>) and PC by 802.1X; (3) phone learns its voice VLAN through LLDP-MED, covered in the <i>IP telephony</i> module (jncip-voip), and the dot1x port keeps <b>voice</b> traffic in the voice VLAN regardless of the data authentication. In every design, verify both devices on a test port before roll-out.</p>

<h3>Dynamic changes</h3>
<p>RADIUS can also change an existing session (Change of Authorization, CoA, and disconnect messages) so that a posture system or administrator can move or disconnect a host immediately. This depends on platform and release, so check the documentation before designing around it. The manual equivalent on the switch is <code>clear dot1x interface</code>.</p>

<div class="warn"><p><b>Common mistakes.</b> Leaving <code>single</code> on ports that serve hubs or desk switches; one authorised user then opens the port for others. Setting <code>reauthentication</code> to 60 seconds on 1,000 ports. Forgetting that <code>single-secure</code> blocks a legitimate second device such as a docking station with a second MAC.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>single</code> authenticates only the first host and lets others through; <code>single-secure</code> authenticates one and blocks others; <code>multiple</code> authenticates every host. Defaults: transmit-period 30, maximum-requests 2, quiet-period 60, reauthentication 3600.</p></div>

<div class="scn"><h4>The docking station that kept being blocked</h4><p>After a security review the team moved all desks to single-secure. A week later a developer could not work: his docking station presented a second MAC from the dock's own LAN controller, and the port blocked it. They changed the developer ports to multiple, with each device authenticating, and the problem vanished.</p><p><b>Lesson:</b> single-secure is strict; count the MAC addresses behind the jack before choosing it.</p></div>

<div class="iv"><p class="q">"What is the difference between single, single-secure and multiple?"</p><p>Single authenticates the first host and then lets other hosts pass. Single-secure authenticates the first host and blocks all other MAC addresses. Multiple authenticates each host separately, so every device behind a desk switch needs its own successful login.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>single = first host, others ride; single-secure = one host only; multiple = each host logs in.</li>
<li>Defaults: transmit 30 s, max-requests 2, quiet 60 s, reauth 3600 s.</li>
<li>Lower transmit-period for faster fallback.</li>
<li>Reauthentication refreshes policy and is when server-fail is evaluated.</li>
<li>Test phone + PC on a single port before roll-out.</li>
</ul></div>
`,hi:`
<p>Port hamesha ek host nahi hota. Ek trainee desk switch share karta hai, phone ke saamne PC, hub do laptops jodta hai. <b>Supplicant mode</b> EX ko batata hai ki port kitne hosts serve kare aur har ek kaise authenticate ho.</p>

<h3>Teen modes</h3>
<table class="cmp"><tr><th>Mode</th><th>Kise authenticate karta hai</th><th>Port ke baaki hosts</th><th>Use</th></tr>
<tr><td><code>single</code> (default)</td><td>pehla host</td><td>pehla host succeed hone ke baad bina apne login ke pass</td><td>aasaan, sabse kamzor</td></tr>
<tr><td><code>single-secure</code></td><td>pehla host</td><td><b>blocked</b></td><td>ek jack par ek device: sabse strict</td></tr>
<tr><td><code>multiple</code></td><td><b>har</b> host, alag-alag</td><td>har ko apni success chahiye</td><td>desk switches, hubs, phone + PC</td></tr></table>
<pre class="code">set protocols dot1x authenticator interface ge-0/0/4 supplicant multiple</pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Supplicant modes">
<rect x="20" y="20" width="180" height="150" rx="12" fill="#e2e8f0"/><text x="110" y="42" text-anchor="middle" class="svg-ink" font-size="13">single</text>
<text x="110" y="75" text-anchor="middle" class="svg-muted" font-size="11">host A login karta hai</text><text x="110" y="95" text-anchor="middle" class="svg-muted" font-size="11">host B saath chal deta hai</text><text x="110" y="125" text-anchor="middle" class="svg-accent" font-size="12">B ka login nahi</text>
<rect x="230" y="20" width="180" height="150" rx="12" fill="#fde68a"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">single-secure</text>
<text x="320" y="75" text-anchor="middle" class="svg-muted" font-size="11">host A login karta hai</text><text x="320" y="95" text-anchor="middle" class="svg-muted" font-size="11">host B blocked</text><text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="12">port par ek device</text>
<rect x="440" y="20" width="180" height="150" rx="12" fill="#bbf7d0"/><text x="530" y="42" text-anchor="middle" class="svg-ink" font-size="13">multiple</text>
<text x="530" y="75" text-anchor="middle" class="svg-muted" font-size="11">host A login karta hai</text><text x="530" y="95" text-anchor="middle" class="svg-muted" font-size="11">host B bhi login karta hai</text><text x="530" y="125" text-anchor="middle" class="svg-accent" font-size="12">har ka apna result</text>
</svg><p class="cap">Jack ke peeche asal mein jo hai usse mode chuno.</p></div>

<h3>Asli output: desk switch ke peeche do trainees</h3>
<p>Lab 3: single-secure ke saath sirf trainee1 andar aaya. ge-0/0/4 par <code>supplicant multiple</code> ke baad dono alag-alag authenticate hote hain:</p>
<pre class="out">lab@SUPSW&gt; show dot1x interface
802.1X Information:
Interface     Role           State           MAC address          User
ge-0/0/1.0    Authenticator  Authenticated   00:50:68:99:b4:01    help1
ge-0/0/4.0    Authenticator  Authenticated   00:50:46:58:ed:01    trainee1
ge-0/0/4.0    Authenticator  Authenticated   00:50:45:58:ec:01    trainee2

lab@SUPSW&gt; show dot1x interface ge-0/0/4 detail
  Supplicant mode:                      <span class="hl">Multiple</span>
  Number of connected supplicants:      2
    Supplicant: trainee1, 00:50:46:58:ed:01
      Operational state:                Authenticated
    Supplicant: trainee2, 00:50:45:58:ec:01
      Operational state:                Authenticated</pre>
<p>Dono trainees ek hi interface par dikhte hain, har ek ke apne MAC aur user ke saath. Har user ko RADIUS se alag VLAN mil sakta hai, par port share hota hai, isliye kai platforms par pehle host ka VLAN poore port par lagta hai. Per-host VLANs ka wada karne se pehle apni release check karo.</p>

<h3>Timers</h3>
<table class="cmp"><tr><th>Statement</th><th>Default</th><th>Matlab</th></tr>
<tr><td><code>transmit-period</code></td><td>30 s</td><td>chup host ko EAP-Request/Identity frames ke beech ka gap</td></tr>
<tr><td><code>maximum-requests</code></td><td>2</td><td>802.1X chhodne se pehle bheje gaye frames</td></tr>
<tr><td><code>quiet-period</code></td><td>60 s</td><td>failed attempt ke baad rukne ka time</td></tr>
<tr><td><code>supplicant-timeout</code></td><td>30 s</td><td>challenge ke jawab ka intezaar</td></tr>
<tr><td><code>server-timeout</code></td><td>30 s</td><td>RADIUS ke jawab ka intezaar</td></tr>
<tr><td><code>retries</code></td><td>3</td><td>quiet period se pehle koshishein</td></tr>
<tr><td><code>reauthentication</code></td><td>3600 s</td><td>authorised host ko kitni baar dobara check karte hain</td></tr></table>
<p>Yeh defaults <code>show dot1x interface ... detail</code> output mein dikhte hain. Tez fallback: <code>transmit-period</code> kam karo (jaise 10) taaki guest VLAN ya MAC RADIUS 60 ki jagah 20 second mein aa jaaye, kuch zyada frames ki keemat par.</p>

<h3>Reauthentication</h3>
<p>Har authorised host reauthentication interval par dobara check hota hai. Isi se badla hua password, delete kiya user, ya badla VLAN assignment bina unplug kiye port tak pahunchta hai. Chhota interval policy updates tez karta hai, par RADIUS load badhata hai, aur (server-fail deny ke saath) RADIUS outage ka exposure bhi. Aam choice 1 se 8 ghante.</p>

<h3>IP phones aur 802.1X</h3>
<p>PC wala phone ek port par do devices hain. Typical designs: (1) phone ka apna supplicant ya certificate plus PC ka apna, port <code>supplicant multiple</code> mein; (2) phone MAC RADIUS (<code>mac-radius</code>) se aur PC 802.1X se; (3) phone apna voice VLAN LLDP-MED se seekhta hai, jo <i>IP telephony</i> module (jncip-voip) mein hai, aur dot1x port data authentication se alag <b>voice</b> traffic voice VLAN mein rakhta hai. Har design mein roll-out se pehle test port par dono devices verify karo.</p>

<h3>Dynamic changes</h3>
<p>RADIUS maujooda session ko bhi badal sakta hai (Change of Authorization, CoA, aur disconnect messages), taaki posture system ya administrator host ko turant move ya disconnect kar sake. Yeh platform aur release par depend karta hai, isliye isse design karne se pehle documentation check karo. Switch par manual equivalent <code>clear dot1x interface</code> hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Hubs ya desk switches wale ports par <code>single</code> chhodna; ek authorised user doosron ke liye port khol deta hai. 1,000 ports par <code>reauthentication</code> 60 second set karna. Yeh bhoolna ki <code>single-secure</code> docking station jaise legitimate doosre device ko block karta hai jiska dock ke apne LAN controller ka doosra MAC hota hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>single</code> sirf pehle host ko authenticate karta hai aur baaki ko pass hone deta hai; <code>single-secure</code> ek ko authenticate karta hai aur baaki ko block; <code>multiple</code> har host ko authenticate karta hai. Defaults: transmit-period 30, maximum-requests 2, quiet-period 60, reauthentication 3600.</p></div>

<div class="scn"><h4>Docking station jo block hota raha</h4><p>Security review ke baad team ne saare desks single-secure par kar diye. Hafte bhar baad ek developer kaam nahi kar paaya: uske docking station ne dock ke apne LAN controller ka doosra MAC dikhaya aur port ne use block kar diya. Developer ports ko multiple par kiya, har device authenticate hua, aur dikkat khatam.</p><p><b>Lesson:</b> single-secure strict hai; chunne se pehle jack ke peeche ke MAC addresses gino.</p></div>

<div class="iv"><p class="q">"single, single-secure aur multiple mein kya difference hai?"</p><p>Single pehle host ko authenticate karke baaki hosts ko pass hone deta hai. Single-secure pehle host ko authenticate karke baaki saare MAC addresses block karta hai. Multiple har host ko alag authenticate karta hai, isliye desk switch ke peeche har device ko apna successful login chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>single = pehla host, baaki saath; single-secure = sirf ek host; multiple = har host login karta hai.</li>
<li>Defaults: transmit 30 s, max-requests 2, quiet 60 s, reauth 3600 s.</li>
<li>Tez fallback ke liye transmit-period kam karo.</li>
<li>Reauthentication policy refresh karta hai aur tab server-fail evaluate hota hai.</li>
<li>Roll-out se pehle ek port par phone + PC test karo.</li>
</ul></div>
`}};export{e as default};