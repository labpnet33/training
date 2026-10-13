var e={id:`macsec`,h:{en:`MACsec: encrypting a switch-to-switch link`,hi:`MACsec: switch-to-switch link ko encrypt karna`},body:{en:`
<p><b>The problem.</b> Everything so far protected the <i>switch</i>. But the cable between two switches (a riser in a shared building, a fibre through a public duct) can be tapped. Frames on it are plain Ethernet: anyone with access to the wire can read them or inject frames. Encrypting at Layer 3 (IPsec) protects only IP and costs extra devices. <b>MACsec (IEEE 802.1AE)</b> encrypts and authenticates <i>every Ethernet frame</i> on a point-to-point link, at line rate, in hardware. Think of it as a sealed pipe between two switches.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="MACsec on an uplink">
<rect x="30" y="60" width="130" height="60" rx="10" fill="#bae6fd"/><text x="95" y="86" text-anchor="middle" class="svg-ink" font-size="14">ACC</text><text x="95" y="106" text-anchor="middle" class="svg-muted" font-size="12">ge-0/0/0</text>
<rect x="480" y="60" width="130" height="60" rx="10" fill="#bae6fd"/><text x="545" y="86" text-anchor="middle" class="svg-ink" font-size="14">CORE</text><text x="545" y="106" text-anchor="middle" class="svg-muted" font-size="12">ge-0/0/0</text>
<rect x="160" y="78" width="320" height="24" rx="12" fill="#bbf7d0"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="12">encrypted + integrity protected frames</text>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="12">MKA: same CKN + same CAK on both ends</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">MKA agrees on a fresh session key (SAK), the CAK is never sent</text>
</svg><p class="cap">The pre-shared CAK authenticates both ends; MKA then creates the session keys.</p></div>

<h3>The pieces</h3>
<dl class="terms">
<dt>CAK (connectivity association key)</dt><dd>The long-term secret both ends share. With static CAK mode you configure it by hand (32 hex digits for 128-bit AES).</dd>
<dt>CKN (connectivity association key name)</dt><dd>The label of that key, carried in MKA messages so the peer knows which CAK to use. It is not secret, but both ends must use the same value.</dd>
<dt>MKA (MACsec Key Agreement)</dt><dd>The protocol, standardised in 802.1X-2010, in which both switches prove they know the CAK, elect a key server and derive the <b>SAK</b>, the session key that actually encrypts frames.</dd>
<dt>Connectivity association (CA)</dt><dd>The named configuration block (here UPLINK) that holds the mode and the key, and is attached to an interface.</dd>
<dt>Secure channel / secure association</dt><dd>One direction of protected traffic and the key currently in use on it. Each side has an outbound and an inbound channel.</dd>
</dl>

<h3>Configuring static CAK</h3>
<pre class="code"><span class="c">! identical on both ends of the link (CORE and ACC)</span>
set security macsec connectivity-association UPLINK security-mode static-cak
set security macsec connectivity-association UPLINK pre-shared-key ckn 0a1b2c3d4e5f
set security macsec connectivity-association UPLINK pre-shared-key cak 5a1e0c3b7d9f24681357acebdf024680
set security macsec interfaces ge-0/0/0 connectivity-association UPLINK
commit</pre>
<p>The stored CAK is shown as <code>## SECRET-DATA</code> in <code>show configuration</code>. Use this mode only on point-to-point links between two devices you control. Static CAK is supported on EX switches on the ports Juniper documents for MACsec, so check the platform guide before you plan a design.</p>

<h3>Verification</h3>
<p>Two commands tell the whole story. A healthy link looks like this (taken from the lab after the fix):</p>
<pre class="out">lab@ACC&gt; show security mka sessions
  Interface name: ge-0/0/0
  CAK name: 0a1b2c3d4e5f
  Transmit interval: 2000(ms)
  Key server: yes  Key server priority: 16
  Peer list
    1. Member identifier: F255244C38B71231 <span class="hl">(live)</span>
       Hold time: 6000 (ms)

lab@ACC&gt; show security macsec connections
    Interface name: ge-0/0/0
        CA name: UPLINK
        Cipher suite: GCM-AES-128   Encryption: on
          Outbound secure channels
            AN: 0 Status: <span class="hl">inuse</span>
          Inbound secure channels
            AN: 0 Status: <span class="hl">inuse</span></pre>
<p>In <code>mka sessions</code> you want a <b>live peer</b>. In <code>macsec connections</code> you want secure associations that are <b>inuse</b> in both directions and encryption <b>on</b>.</p>
<p>A broken link looks very different. Here ACC has a CAK that differs from CORE's by one digit:</p>
<pre class="out">lab@ACC&gt; show security mka sessions
  Interface name: ge-0/0/0
  CAK name: 0a1b2c3d4e5f
  Peer list
    <span class="hl">(none: MKA packets from the peer fail the integrity check (ICV))</span>

lab@ACC&gt; show security macsec connections
        CA name: UPLINK
          Secure channels: none (MKA packets from the peer fail the integrity check (ICV)), <span class="hl">traffic blocked</span></pre>
<p>The CKN matched (the peer name is the same) but the CAK did not, so every MKA packet fails its integrity check and no channel is created. The port is up at the physical level, yet no traffic passes. That is the signature of a mismatched CAK.</p>

<h3>Design decisions</h3>
<ul>
<li><b>Fail closed or fail open.</b> By default an interface that cannot establish MACsec does not forward user traffic. Some platforms offer a should-secure style fallback to clear text; it avoids outages but allows a downgrade attack, so avoid it on sensitive links.</li>
<li><b>Replay protection</b> and an <b>offset</b> for clear-text VLAN tags can be configured for specific designs; the defaults suit most labs.</li>
<li><b>Key rotation.</b> The SAK is refreshed automatically; the CAK must be changed by you on both ends. Plan a maintenance window and change both sides, because one side alone breaks the link.</li>
<li><b>Not end to end.</b> MACsec protects one hop. Traffic is decrypted at each switch, so on-switch controls (chapters 2 to 5) are still needed.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Copying the CAK by hand and making one-digit typos. Paste it from a password manager, compare the first and last digits on both ends, and keep a rollback ready with <code>commit confirmed</code> (the link may drop the moment you commit).</p></div>
<div class="exam"><p><b>Exam trap.</b> MACsec is <b>hop by hop</b> and encrypts at Layer 2; it is not a replacement for IPsec between sites. The CKN is the name and the CAK is the secret; an empty peer list means the keys (CAK) do not match, or the other side is not enabled.</p></div>

<div class="scn"><h4>The uplink that came up and carried nothing</h4><p>After a weekend change, the lab switch ACC had link lights on its uplink but nothing flowed. The engineer saw the interface up and spent an hour on VLANs. <code>show security macsec connections</code> said "traffic blocked" with an ICV failure. Comparing <code>show configuration security macsec</code> on both switches showed the CAK ended in 6 on ACC and in 0 on CORE. One corrected digit and a commit brought the secure channels up in seconds.</p><p><b>Lesson:</b> when a MACsec link is up but silent, read the MKA peer list first.</p></div>
<div class="iv"><p class="q">"How does MACsec work and how would you troubleshoot it?"</p><p>MACsec 802.1AE encrypts frames between two directly connected devices. With static CAK, both ends hold the same CKN and CAK; MKA authenticates them and distributes a session key. Check <code>show security mka sessions</code> for a live peer, then <code>show security macsec connections</code> for inuse secure associations. An empty peer list points to a CAK mismatch or a missing configuration on the far side.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MACsec (802.1AE) encrypts and authenticates every frame on a point-to-point link.</li>
<li>Static CAK: matching CKN and CAK on both ends; MKA derives the session key.</li>
<li>Healthy: a <b>live</b> peer and <b>inuse</b> secure associations.</li>
<li>CAK mismatch gives an empty peer list, an ICV failure and blocked traffic.</li>
<li>MACsec is hop by hop; it complements, not replaces, the other controls.</li>
</ul></div>
`,hi:`
<p><b>Problem.</b> Ab tak ki saari cheezein <i>switch</i> ko bachati thi. Lekin do switches ke beech ka cable (shared building ka riser, public duct se guzarta fibre) tap ho sakta hai. Us par frames plain Ethernet hain: wire tak pahunch wala koi bhi unhe padh sakta hai ya frames inject kar sakta hai. Layer 3 par encryption (IPsec) sirf IP ko bachata hai aur extra devices ka kharcha hota hai. <b>MACsec (IEEE 802.1AE)</b> point-to-point link ke <i>har Ethernet frame</i> ko encrypt aur authenticate karta hai, line rate par, hardware mein. Ise do switches ke beech sealed pipe samjho.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Uplink par MACsec">
<rect x="30" y="60" width="130" height="60" rx="10" fill="#bae6fd"/><text x="95" y="86" text-anchor="middle" class="svg-ink" font-size="14">ACC</text><text x="95" y="106" text-anchor="middle" class="svg-muted" font-size="12">ge-0/0/0</text>
<rect x="480" y="60" width="130" height="60" rx="10" fill="#bae6fd"/><text x="545" y="86" text-anchor="middle" class="svg-ink" font-size="14">CORE</text><text x="545" y="106" text-anchor="middle" class="svg-muted" font-size="12">ge-0/0/0</text>
<rect x="160" y="78" width="320" height="24" rx="12" fill="#bbf7d0"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="12">encrypted + integrity protected frames</text>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="12">MKA: dono ends par same CKN + same CAK</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">MKA naya session key (SAK) tay karta hai, CAK kabhi bheja nahi jaata</text>
</svg><p class="cap">Pre-shared CAK dono ends ko authenticate karta hai; phir MKA session keys banata hai.</p></div>

<h3>Ke hisse</h3>
<dl class="terms">
<dt>CAK (connectivity association key)</dt><dd>Lambe samay ka secret jo dono ends share karte hain. Static CAK mode mein aap haath se configure karte ho (128-bit AES ke liye 32 hex digits).</dd>
<dt>CKN (connectivity association key name)</dt><dd>Us key ka label, jo MKA messages mein jaata hai taaki peer ko pata chale kaunsa CAK use karna hai. Yeh secret nahi hai, lekin dono ends par same value honi chahiye.</dd>
<dt>MKA (MACsec Key Agreement)</dt><dd>Woh protocol (802.1X-2010 mein standardised) jisme dono switches saabit karte hain ki unhe CAK pata hai, key server chunte hain aur <b>SAK</b> nikalte hain, jo session key frames ko asal mein encrypt karti hai.</dd>
<dt>Connectivity association (CA)</dt><dd>Naam wala configuration block (yahan UPLINK) jisme mode aur key hoti hai aur jo interface se attach hota hai.</dd>
<dt>Secure channel / secure association</dt><dd>Protected traffic ki ek direction aur us par abhi use ho rahi key. Har side ka outbound aur inbound channel hota hai.</dd>
</dl>

<h3>Static CAK configure karna</h3>
<pre class="code"><span class="c">! link ke dono ends (CORE aur ACC) par ek jaisa</span>
set security macsec connectivity-association UPLINK security-mode static-cak
set security macsec connectivity-association UPLINK pre-shared-key ckn 0a1b2c3d4e5f
set security macsec connectivity-association UPLINK pre-shared-key cak 5a1e0c3b7d9f24681357acebdf024680
set security macsec interfaces ge-0/0/0 connectivity-association UPLINK
commit</pre>
<p>Stored CAK <code>show configuration</code> mein <code>## SECRET-DATA</code> dikhta hai. Yeh mode sirf aise point-to-point links par use karo jahan do devices aapke hon. EX switches par static CAK un ports par supported hai jinhe Juniper MACsec ke liye document karta hai, isliye design se pehle platform guide dekho.</p>

<h3>Verification</h3>
<p>Do commands poori kahani batate hain. Healthy link aisa dikhta hai (fix ke baad lab se liya):</p>
<pre class="out">lab@ACC&gt; show security mka sessions
  Interface name: ge-0/0/0
  CAK name: 0a1b2c3d4e5f
  Transmit interval: 2000(ms)
  Key server: yes  Key server priority: 16
  Peer list
    1. Member identifier: F255244C38B71231 <span class="hl">(live)</span>
       Hold time: 6000 (ms)

lab@ACC&gt; show security macsec connections
    Interface name: ge-0/0/0
        CA name: UPLINK
        Cipher suite: GCM-AES-128   Encryption: on
          Outbound secure channels
            AN: 0 Status: <span class="hl">inuse</span>
          Inbound secure channels
            AN: 0 Status: <span class="hl">inuse</span></pre>
<p><code>mka sessions</code> mein aapko <b>live peer</b> chahiye. <code>macsec connections</code> mein dono directions mein <b>inuse</b> secure associations aur encryption <b>on</b> chahiye.</p>
<p>Toota hua link bahut alag dikhta hai. Yahan ACC ka CAK CORE se ek digit alag hai:</p>
<pre class="out">lab@ACC&gt; show security mka sessions
  Interface name: ge-0/0/0
  CAK name: 0a1b2c3d4e5f
  Peer list
    <span class="hl">(none: MKA packets from the peer fail the integrity check (ICV))</span>

lab@ACC&gt; show security macsec connections
        CA name: UPLINK
          Secure channels: none (MKA packets from the peer fail the integrity check (ICV)), <span class="hl">traffic blocked</span></pre>
<p>CKN match hua (peer ka naam wahi hai) lekin CAK nahi, isliye har MKA packet ka integrity check fail hota hai aur koi channel nahi banta. Port physical level par up hai phir bhi traffic nahi chalta. Mismatched CAK ki yahi pehchaan hai.</p>

<h3>Design decisions</h3>
<ul>
<li><b>Fail closed ya fail open.</b> Default mein jo interface MACsec establish nahi kar paata woh user traffic forward nahi karta. Kuch platforms clear text fallback (should-secure jaisa) dete hain; isse outage bachta hai lekin downgrade attack ka mauka milta hai, isliye sensitive links par avoid karo.</li>
<li><b>Replay protection</b> aur clear-text VLAN tags ka <b>offset</b> khaas designs ke liye configure ho sakte hain; zyaadatar labs ke liye defaults theek hain.</li>
<li><b>Key rotation.</b> SAK apne aap refresh hota hai; CAK aapko dono ends par badalna hota hai. Maintenance window plan karo aur dono sides badlo, kyunki ek side akeli link tod deti hai.</li>
<li><b>End to end nahi.</b> MACsec ek hop ko bachata hai. Har switch par traffic decrypt hota hai, isliye on-switch controls (chapters 2 se 5) ab bhi chahiye.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> CAK haath se copy karna aur ek digit ki typo kar dena. Password manager se paste karo, dono ends par pehle aur aakhri digits milao, aur <code>commit confirmed</code> se rollback ready rakho (commit karte hi link gir sakta hai).</p></div>
<div class="exam"><p><b>Exam trap.</b> MACsec <b>hop by hop</b> hai aur Layer 2 par encrypt karta hai; yeh sites ke beech IPsec ki jagah nahi leta. CKN naam hai aur CAK secret; peer list khaali hone ka matlab keys (CAK) match nahi karte, ya doosri side enable nahi hai.</p></div>

<div class="scn"><h4>Uplink jo up aaya aur kuch nahi le gaya</h4><p>Weekend change ke baad lab switch ACC ke uplink par link lights the lekin kuch nahi chal raha tha. Engineer ne interface up dekha aur ek ghanta VLANs mein lagaya. <code>show security macsec connections</code> ne ICV failure ke saath "traffic blocked" bataya. Dono switches par <code>show configuration security macsec</code> compare karne par dikha ki CAK ACC par 6 se aur CORE par 0 se khatam hota tha. Ek digit theek karke commit karne se secure channels kuch seconds mein aa gaye.</p><p><b>Lesson:</b> MACsec link up ho par chup ho to pehle MKA peer list padho.</p></div>
<div class="iv"><p class="q">"MACsec kaise kaam karta hai aur troubleshoot kaise karoge?"</p><p>MACsec 802.1AE directly connected do devices ke beech frames encrypt karta hai. Static CAK mein dono ends ke paas same CKN aur CAK hote hain; MKA unhe authenticate karke session key baantta hai. <code>show security mka sessions</code> mein live peer dekho, phir <code>show security macsec connections</code> mein inuse secure associations. Khaali peer list CAK mismatch ya doosri taraf configuration na hone ki taraf ishara karti hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MACsec (802.1AE) point-to-point link ke har frame ko encrypt aur authenticate karta hai.</li>
<li>Static CAK: dono ends par matching CKN aur CAK; MKA session key nikalta hai.</li>
<li>Healthy: <b>live</b> peer aur <b>inuse</b> secure associations.</li>
<li>CAK mismatch se khaali peer list, ICV failure aur blocked traffic.</li>
<li>MACsec hop by hop hai; baaki controls ka poorak hai, badal nahi.</li>
</ul></div>
`}};export{e as default};