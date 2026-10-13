var e={id:`central-nat`,h:{en:`Central NAT basics: a separate table for source NAT`,hi:`Central NAT basics: source NAT ke liye alag table`},body:{en:`
<p>So far, NAT lived inside each firewall policy: <code>nat enable</code>, a pool name. That is simple, but with hundreds of policies the translation rules are scattered. Some teams prefer one place for all source NAT rules, the way a company keeps one list of outgoing numbers instead of writing the number on every form. FortiOS offers that as <b>central NAT</b>.</p>
<div class="note"><p><b>Honest scope note.</b> The simulator runs FortiOS policy-based NAT only. The commands below could not be run in it, so every block in this chapter is a <b>reference configuration (not run in the simulator)</b>. There is no captured output here, and no lab for it. Practise the policy-based NAT in the other chapters, and use the reference to understand how the same ideas map to central NAT.</p></div>

<h3>Two NAT modes</h3>
<table class="cmp"><tr><th></th><th>Policy-based NAT (default)</th><th>Central NAT</th></tr>
<tr><td>Where SNAT is set</td><td>In each policy: <code>nat enable</code>, optional pool</td><td>In <code>config firewall central-snat-map</code></td></tr>
<tr><td>Policy NAT options</td><td>Visible</td><td>Not used for translation</td></tr>
<tr><td>Match for NAT</td><td>The policy itself</td><td>Its own match: interfaces, original and destination address, protocol, port</td></tr>
<tr><td>Evaluation</td><td>The matched policy decides</td><td>Top-down, first matching NAT map entry</td></tr>
<tr><td>DNAT / VIPs</td><td>VIP objects as policy destination</td><td>VIP objects still publish servers</td></tr>
<tr><td>Best for</td><td>Small and mid-size rule sets, simplicity</td><td>Many policies sharing the same NAT rules, or NAT aligned with other vendors' firewalls</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Central NAT flow">
<rect x="10" y="60" width="110" height="60" rx="10" fill="#bae6fd"/><text x="65" y="86" text-anchor="middle" class="svg-ink" font-size="13">Packet in</text><text x="65" y="104" text-anchor="middle" class="svg-muted" font-size="12">from LAN</text>
<rect x="160" y="60" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="225" y="86" text-anchor="middle" class="svg-ink" font-size="13">Firewall policy</text><text x="225" y="104" text-anchor="middle" class="svg-muted" font-size="12">accept or deny</text>
<rect x="330" y="60" width="150" height="60" rx="10" fill="#fde68a"/><text x="405" y="86" text-anchor="middle" class="svg-ink" font-size="13">Central SNAT map</text><text x="405" y="104" text-anchor="middle" class="svg-muted" font-size="12">first match wins</text>
<rect x="520" y="60" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="575" y="86" text-anchor="middle" class="svg-ink" font-size="13">Out, new</text><text x="575" y="104" text-anchor="middle" class="svg-muted" font-size="12">source address</text>
<line x1="120" y1="90" x2="160" y2="90" stroke="#64748b" stroke-width="2"/><line x1="290" y1="90" x2="330" y2="90" stroke="#64748b" stroke-width="2"/><line x1="480" y1="90" x2="520" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="160" text-anchor="middle" class="svg-accent" font-size="12">policy accepts first, then NAT table picks the translation</text>
</svg><p class="cap">Two tables: the policy table decides permission; the NAT table decides translation.</p></div>

<h3>Turn central NAT on</h3>
<p>Central NAT is a system-wide switch under <code>config system settings</code>. Once it is on, the policy no longer controls translation; you define NAT entries instead:</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config system settings
    set central-nat enable
end</pre>
<p>On a real unit read the warning message before you confirm: enabling central NAT changes how existing policies behave, because their <code>nat</code> setting stops driving translation. Plan a change window and review all NAT entries before turning it on. Without a matching central NAT entry, traffic goes out with its original address.</p>

<h3>A central SNAT map entry</h3>
<p>The Pune requirement of chapter 3 (LAN to internet through 203.0.113.5 and 203.0.113.6) looks like this in central NAT. The pool is the same IP pool object; only the place that points at it changes:</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config firewall ippool
    edit "NAT-POOL"
        set startip 203.0.113.5
        set endip 203.0.113.6
    next
end
config firewall central-snat-map
    edit 1
        set status enable
        set orig-addr "LAN_NET"
        set srcintf "port2"
        set dst-addr "all"
        set dstintf "port1"
        set nat enable
        set nat-ippool "NAT-POOL"
    next
end</pre>
<ul>
<li><code>srcintf</code> and <code>dstintf</code> are the interfaces, like a policy.</li>
<li><code>orig-addr</code> and <code>dst-addr</code> are address objects for the original source and the destination.</li>
<li><code>nat-ippool</code> picks the pool. If you leave it out, the egress interface address is used (the same default as policy-based NAT).</li>
<li>Optional <code>protocol</code>, <code>orig-port</code> and <code>nat-port</code> restrict the entry to a service and a translated port range.</li>
<li>Entries are checked in order, the first match wins, and the order is changed with <code>move</code>, exactly like policies. Field names can differ slightly between releases, so confirm with <code>?</code>.</li>
</ul>

<h3>Publishing servers in central NAT</h3>
<p>Servers are still published with VIP objects (<code>config firewall vip</code>), and the inbound policy still uses the VIP as its destination. Use this when you mix modes mentally: <b>SNAT is the part that moves to the central table; DNAT through VIPs works as in chapter 4 and 5.</b></p>

<h3>When would you choose it?</h3>
<ul>
<li>Many policies that should share one NAT behaviour, so one map entry replaces 40 copies of "nat enable + pool".</li>
<li>Migrating from a firewall that has a separate NAT rulebase.</li>
<li>Audits that ask "show me all your source NAT rules" and expect one table.</li>
<li>When you do <i>not</i> need it: a single-branch firewall with five policies. Policy-based NAT is simpler to read.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A company with six sites, 120 policies and one corporate rule "all user traffic leaves through the pool" turns on central NAT. One entry for each site covers LAN to WAN. A new policy added next month needs no NAT work: if it goes to the WAN and the entry matches, translation happens automatically. In policy-based mode, each new policy would have needed <code>nat enable</code> and <code>poolname</code>.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Enabling central NAT without creating entries, so users leave with their private addresses and everything stops; keeping policy-level NAT settings in mind when troubleshooting central NAT; putting a broad NAT entry above specific ones; forgetting that policies still decide permission.</p></div>
<div class="exam"><p><b>Exam trap.</b> Central NAT does <b>not</b> replace firewall policies. The policy still has to accept the traffic. It only moves <i>source translation</i> into a separate table. Also, the NAT table is matched top-down and the first entry that matches is used.</p></div>

<div class="scn"><h4>Everything stopped at 02:15</h4><p>During a maintenance window an engineer enabled central NAT to align with a new standard. Internet access stopped at once. Sessions showed private source addresses on the WAN link. No central SNAT entry existed yet, so nothing translated the sources. Adding an entry for the LAN subnet restored service. The post-incident rule: write the central NAT entries first, and enable the mode last.</p><p><b>Lesson:</b> central NAT changes where the translation decision lives. Prepare the NAT table before the switch.</p></div>

<div class="iv"><p class="q">"What is central NAT on a FortiGate and when would you use it?"</p><p>It is a mode (<code>central-nat enable</code>) in which source NAT is configured in a separate table, <code>central-snat-map</code>, matched top-down, instead of in each policy. Policies still decide permission. Use it when many policies share NAT behaviour or when you want one NAT rulebase. Mention that VIPs still handle destination NAT, and the risk of enabling it before the entries exist.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Central NAT moves source NAT out of the policy into <code>config firewall central-snat-map</code>.</li>
<li>It is enabled with <code>config system settings</code>, <code>set central-nat enable</code>.</li>
<li>Policies still accept or deny; the NAT table only translates, first match wins.</li>
<li>VIPs continue to publish servers.</li>
<li>Prepare NAT entries before enabling; the simulator does not run this mode.</li>
</ul></div>
`,hi:`
<p>Ab tak NAT har firewall policy ke andar rehta tha: <code>nat enable</code>, ek pool ka naam. Yeh simple hai, lekin sainkdon policies mein translation rules bikhre ho jaate hain. Kuch teams ek hi jagah saare source NAT rules chahti hain, jaise company outgoing numbers ki ek list rakhti hai har form par number likhne ki jagah. FortiOS yeh <b>central NAT</b> ke roop mein deta hai.</p>
<div class="note"><p><b>Honest scope note.</b> Simulator sirf FortiOS policy-based NAT chalata hai. Neeche ke commands usme run nahi ho sakte, isliye is chapter ka har block <b>reference configuration (not run in the simulator)</b> hai. Yahan koi captured output nahi hai, aur iske liye koi lab nahi hai. Policy-based NAT ko doosre chapters mein practise karo, aur reference se samjho ki wahi ideas central NAT mein kaise map hote hain.</p></div>

<h3>Do NAT modes</h3>
<table class="cmp"><tr><th></th><th>Policy-based NAT (default)</th><th>Central NAT</th></tr>
<tr><td>SNAT kahan set hota hai</td><td>Har policy mein: <code>nat enable</code>, optional pool</td><td><code>config firewall central-snat-map</code> mein</td></tr>
<tr><td>Policy NAT options</td><td>Dikhte hain</td><td>Translation ke liye use nahi hote</td></tr>
<tr><td>NAT ke liye match</td><td>Policy khud</td><td>Uska apna match: interfaces, original aur destination address, protocol, port</td></tr>
<tr><td>Evaluation</td><td>Matched policy decide karti hai</td><td>Upar se neeche, pehli matching NAT map entry</td></tr>
<tr><td>DNAT / VIPs</td><td>VIP objects policy destination ke roop mein</td><td>VIP objects ab bhi servers publish karte hain</td></tr>
<tr><td>Kiske liye best</td><td>Chhote aur mid-size rule sets, simplicity</td><td>Aisi kai policies jo same NAT rules share karti hain, ya doosre vendors ke firewalls se aligned NAT</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Central NAT flow">
<rect x="10" y="60" width="110" height="60" rx="10" fill="#bae6fd"/><text x="65" y="86" text-anchor="middle" class="svg-ink" font-size="13">Packet in</text><text x="65" y="104" text-anchor="middle" class="svg-muted" font-size="12">LAN se</text>
<rect x="160" y="60" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="225" y="86" text-anchor="middle" class="svg-ink" font-size="13">Firewall policy</text><text x="225" y="104" text-anchor="middle" class="svg-muted" font-size="12">accept ya deny</text>
<rect x="330" y="60" width="150" height="60" rx="10" fill="#fde68a"/><text x="405" y="86" text-anchor="middle" class="svg-ink" font-size="13">Central SNAT map</text><text x="405" y="104" text-anchor="middle" class="svg-muted" font-size="12">pehla match jeetta hai</text>
<rect x="520" y="60" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="575" y="86" text-anchor="middle" class="svg-ink" font-size="13">Out, naya</text><text x="575" y="104" text-anchor="middle" class="svg-muted" font-size="12">source address</text>
<line x1="120" y1="90" x2="160" y2="90" stroke="#64748b" stroke-width="2"/><line x1="290" y1="90" x2="330" y2="90" stroke="#64748b" stroke-width="2"/><line x1="480" y1="90" x2="520" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="160" text-anchor="middle" class="svg-accent" font-size="12">pehle policy accept karti hai, phir NAT table translation chunti hai</text>
</svg><p class="cap">Do tables: policy table permission decide karti hai; NAT table translation decide karti hai.</p></div>

<h3>Central NAT on karo</h3>
<p>Central NAT <code>config system settings</code> ke neeche system-wide switch hai. On hone ke baad policy translation control nahi karti; aap uski jagah NAT entries define karte ho:</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config system settings
    set central-nat enable
end</pre>
<p>Real unit par confirm karne se pehle warning message padho: central NAT enable karne se existing policies ka behaviour badalta hai, kyunki unki <code>nat</code> setting translation drive karna band kar deti hai. Change window plan karo aur on karne se pehle saari NAT entries review karo. Matching central NAT entry ke bina traffic apne original address ke saath bahar jaata hai.</p>

<h3>Central SNAT map entry</h3>
<p>Chapter 3 ki Pune requirement (LAN se internet 203.0.113.5 aur 203.0.113.6 ke through) central NAT mein aisi dikhti hai. Pool wahi IP pool object hai; sirf jo jagah use point karti hai woh badalti hai:</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config firewall ippool
    edit "NAT-POOL"
        set startip 203.0.113.5
        set endip 203.0.113.6
    next
end
config firewall central-snat-map
    edit 1
        set status enable
        set orig-addr "LAN_NET"
        set srcintf "port2"
        set dst-addr "all"
        set dstintf "port1"
        set nat enable
        set nat-ippool "NAT-POOL"
    next
end</pre>
<ul>
<li><code>srcintf</code> aur <code>dstintf</code> interfaces hain, policy ki tarah.</li>
<li><code>orig-addr</code> aur <code>dst-addr</code> original source aur destination ke address objects hain.</li>
<li><code>nat-ippool</code> pool chunta hai. Chhod do to egress interface address use hota hai (policy-based NAT jaisa default).</li>
<li>Optional <code>protocol</code>, <code>orig-port</code> aur <code>nat-port</code> entry ko ek service aur translated port range tak restrict karte hain.</li>
<li>Entries order mein check hoti hain, pehla match jeetta hai, aur order policies ki tarah <code>move</code> se badalta hai. Field names releases ke beech thode alag ho sakte hain, isliye <code>?</code> se confirm karo.</li>
</ul>

<h3>Central NAT mein servers publish karna</h3>
<p>Servers ab bhi VIP objects (<code>config firewall vip</code>) se publish hote hain, aur inbound policy ab bhi VIP ko destination banati hai. Modes dimaag mein milate waqt yeh yaad rakho: <b>SNAT central table mein jaata hai; VIPs ke through DNAT chapter 4 aur 5 jaisa hi kaam karta hai.</b></p>

<h3>Kab choose karoge?</h3>
<ul>
<li>Kai policies jo ek NAT behaviour share karti hain, taaki ek map entry "nat enable + pool" ki 40 copies replace kare.</li>
<li>Aise firewall se migration jisme alag NAT rulebase hai.</li>
<li>Audits jo poochhte hain "mujhe apne saare source NAT rules dikhao" aur ek table ki ummeed karte hain.</li>
<li>Kab zaroorat <i>nahi</i>: paanch policies wala single-branch firewall. Policy-based NAT padhne mein aasaan hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Chhe sites, 120 policies aur ek corporate rule "saara user traffic pool se nikle" wali company central NAT on karti hai. Har site ke liye ek entry LAN se WAN cover karti hai. Agle mahine add hui nayi policy ko NAT ka kaam nahi chahiye: WAN ki taraf jaye aur entry match kare to translation apne aap hota hai. Policy-based mode mein har nayi policy ko <code>nat enable</code> aur <code>poolname</code> chahiye hota.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Entries banaye bina central NAT enable karna, jisse users private addresses ke saath nikalte hain aur sab ruk jaata hai; central NAT troubleshoot karte waqt policy-level NAT settings ke baare mein sochna; specific entries ke upar broad NAT entry daalna; yeh bhoolna ki policies abhi bhi permission decide karti hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Central NAT firewall policies ko replace <b>nahi</b> karta. Policy ko phir bhi traffic accept karna padta hai. Yeh sirf <i>source translation</i> ko alag table mein le jaata hai. Aur NAT table upar se neeche match hoti hai aur jo pehli entry match kare wahi use hoti hai.</p></div>

<div class="scn"><h4>Raat 02:15 par sab ruk gaya</h4><p>Maintenance window mein ek engineer ne naye standard se align karne ke liye central NAT enable kiya. Internet access turant ruk gaya. Sessions mein WAN link par private source addresses dikhe. Koi central SNAT entry thi hi nahi, isliye sources ko koi translate nahi kar raha tha. LAN subnet ke liye entry add karne se service wapas aayi. Post-incident rule: pehle central NAT entries likho, aur mode aakhir mein enable karo.</p><p><b>Lesson:</b> central NAT translation ka decision kahan rehta hai woh badal deta hai. Switch se pehle NAT table taiyaar karo.</p></div>

<div class="iv"><p class="q">"FortiGate par central NAT kya hai aur kab use karoge?"</p><p>Yeh ek mode (<code>central-nat enable</code>) hai jisme source NAT har policy ki jagah alag table, <code>central-snat-map</code>, mein configure hota hai, jo upar se neeche match hoti hai. Policies phir bhi permission decide karti hain. Tab use karo jab kai policies NAT behaviour share karein ya ek NAT rulebase chahiye. Batao ki VIPs ab bhi destination NAT handle karte hain, aur entries bane bina enable karne ka risk.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Central NAT source NAT ko policy se nikalkar <code>config firewall central-snat-map</code> mein le jaata hai.</li>
<li>Yeh <code>config system settings</code>, <code>set central-nat enable</code> se on hota hai.</li>
<li>Policies accept ya deny karti hain; NAT table sirf translate karti hai, pehla match jeetta hai.</li>
<li>VIPs servers publish karte rehte hain.</li>
<li>Enable se pehle NAT entries taiyaar karo; simulator yeh mode nahi chalata.</li>
</ul></div>
`}};export{e as default};