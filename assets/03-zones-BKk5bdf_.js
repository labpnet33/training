var e={id:`zones`,h:{en:`Zones: the "from" and "to" of every rule`,hi:`Zones: har rule ka "from" aur "to"`},body:{en:`
<p><b>Analogy: rooms in a building.</b> A bank has a public lobby, a staff area and a vault. Nobody writes rules for each door handle. They write rules between <b>areas</b>: "Staff may go from the lobby side to the staff area. Customers may not enter the vault." A PAN-OS <b>security zone</b> is exactly that: a named area of the network. You put interfaces into zones, and then you write policy between zones.</p>

<h3>What a zone is</h3>
<p>A zone is a logical group of one or more interfaces that share the same security level. Common names are <code>trust</code> (inside LAN), <code>untrust</code> (internet) and <code>dmz</code> (public servers). The names are only labels you choose. What matters:</p>
<ul>
<li>An interface can belong to <b>only one zone</b>. A zone can contain many interfaces.</li>
<li>A zone has a <b>type</b> that matches how its interfaces are deployed: Layer 3, Layer 2, virtual wire, tap, or external. A Layer 3 interface goes into a Layer 3 zone.</li>
<li>Traffic is described as <b>from zone A to zone B</b>. Every session has exactly one source zone and one destination zone.</li>
<li>An interface with <b>no zone</b> passes no traffic. The firewall has no policy "place" for it.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Zones and interfaces">
<rect x="230" y="70" width="180" height="70" rx="10" fill="#ddd6fe"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="14">Firewall</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">policy between zones</text>
<rect x="10" y="60" width="150" height="90" rx="10" fill="#bbf7d0"/><text x="85" y="88" text-anchor="middle" class="svg-ink" font-size="14">zone: trust</text><text x="85" y="110" text-anchor="middle" class="svg-muted" font-size="12">ethernet1/2</text><text x="85" y="130" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.0/24</text>
<rect x="480" y="10" width="150" height="80" rx="10" fill="#fde68a"/><text x="555" y="38" text-anchor="middle" class="svg-ink" font-size="14">zone: untrust</text><text x="555" y="60" text-anchor="middle" class="svg-muted" font-size="12">ethernet1/1</text><text x="555" y="78" text-anchor="middle" class="svg-muted" font-size="12">internet side</text>
<rect x="480" y="120" width="150" height="80" rx="10" fill="#fed7aa"/><text x="555" y="148" text-anchor="middle" class="svg-ink" font-size="14">zone: dmz</text><text x="555" y="170" text-anchor="middle" class="svg-muted" font-size="12">ethernet1/3</text><text x="555" y="188" text-anchor="middle" class="svg-muted" font-size="12">10.0.2.0/24</text>
<line x1="160" y1="105" x2="230" y2="105" stroke="#64748b" stroke-width="2"/><line x1="410" y1="85" x2="480" y2="55" stroke="#64748b" stroke-width="2"/><line x1="410" y1="125" x2="480" y2="155" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Rules are written between zones, never directly between interfaces.</p></div>

<h3>The two built-in default rules</h3>
<p>Every PAN-OS firewall has two predefined rules at the very bottom of the security rulebase. You can see their effect even with an empty rulebase:</p>
<ul>
<li><b>intrazone-default</b>: traffic that stays <b>inside one zone</b> is allowed.</li>
<li><b>interzone-default</b>: traffic that crosses <b>between zones</b> is denied.</li>
</ul>
<p>So with no rules, hosts in the same zone talk freely and nothing crosses between zones. That is the "default deny between zones" posture. The simulator reproduces it:</p>
<pre class="out">admin@PA1&gt; test security-policy-match from trust to trust source 10.0.1.10 destination 10.0.1.11 protocol 6 destination-port 80
<span class="hl">No rule matched. Traffic falls to the predefined "intrazone-default" rule (action allow).</span>

admin@PA1&gt; test security-policy-match from trust to untrust source 10.0.1.10 destination 8.8.8.8 protocol 6 destination-port 443
<span class="hl">No rule matched. Traffic falls to the predefined "interzone-default" rule (action deny).</span></pre>
<p>Note that the default deny does not log by default, which is why teams often add an explicit deny-all rule at the bottom with logging turned on. You will do that in pan-policy.</p>

<h3>What an interface without a zone looks like</h3>
<p>The <code>show interface all</code> command lists every logical interface with its zone and virtual router. Here is the DMZ interface right after an admin gave it an IP but forgot the zone and the router. This is the situation of the pan-setup troubleshooting lab:</p>
<pre class="out">name                id    vsys zone             forwarding               tag    address
------------------- ----- ---- ---------------- ------------------------ ------ ------------------
ethernet1/1         16    1    untrust          vr:default               0      203.0.113.2/30
ethernet1/2         17    1    trust            vr:default               0      10.0.1.1/24
ethernet1/3         18    1    <span class="hl">N/A              N/A</span>                      0      10.0.2.1/24</pre>
<p>Zone <code>N/A</code> and forwarding <code>N/A</code> mean no zone and no virtual router. The IP is configured, yet nothing works.</p>

<div class="eg"><p><b>Worked example.</b> A branch firewall has ethernet1/2 in <code>trust</code>, ethernet1/3 in <code>dmz</code>, ethernet1/1 in <code>untrust</code>. A PC at 10.0.1.10 opens a page on the DMZ server 10.0.2.10. The firewall decides the source zone is trust (the interface the packet arrived on) and the destination zone is dmz (the egress interface found by routing). It then looks for a rule "from trust to dmz". The zones come from the interfaces plus the routing table, never from the IP addresses written in the rule.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Putting two unrelated networks in one zone because they "look similar" (the intrazone-default rule then allows them to talk). Forgetting that the destination zone is found by a route lookup, so a missing route can give a confusing zone or a drop. Using zone names that differ by one letter between interface and rule: the commit fails with an invalid reference.</p></div>
<div class="exam"><p><b>Exam trap.</b> Intrazone traffic is allowed by default, interzone traffic is denied by default. A second trap: the exam may call rules "zone-based" but ask which object a rule is written between. The answer is zones, not interfaces and not VLANs.</p></div>

<div class="scn"><h4>The contractor Wi-Fi that could reach the servers</h4><p>A site put the contractor Wi-Fi VLAN and the server VLAN into the same <code>internal</code> zone to save time. Because intrazone traffic is allowed by default, contractor laptops could reach servers with no rule at all, and nothing showed in the deny logs. The fix was a separate <code>contractors</code> zone and an explicit rule allowing only the applications they needed.</p><p><b>Lesson:</b> a zone is a trust boundary. Do not merge networks that should be separated.</p></div>

<div class="iv"><p class="q">"What happens to traffic between two interfaces in the same zone?"</p><p>It is allowed by the predefined intrazone-default rule, so it does not need a rule, unless you override that rule or add a deny rule. Traffic between different zones is denied by interzone-default until you allow it. Mention that you can change the default behaviour by overriding the predefined rules.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A zone is a named group of interfaces; an interface is in one zone only.</li>
<li>Every session has a source zone and a destination zone.</li>
<li>Intrazone-default allows; interzone-default denies.</li>
<li>An interface with no zone shows N/A and passes nothing.</li>
<li>The destination zone comes from the routing lookup.</li>
</ul></div>
`,hi:`
<p><b>Analogy: building ke kamre.</b> Bank mein public lobby, staff area aur vault hota hai. Koi har darwaze ke handle ke liye rule nahi likhta. Rules <b>areas</b> ke beech likhe jaate hain: "Staff lobby side se staff area mein ja sakta hai. Customers vault mein nahi ja sakte." PAN-OS <b>security zone</b> bilkul wahi hai: network ka ek naam wala area. Aap interfaces ko zones mein daalte ho, phir zones ke beech policy likhte ho.</p>

<h3>Zone kya hai</h3>
<p>Zone ek ya zyada interfaces ka logical group hai jinka security level same hota hai. Aam naam <code>trust</code> (inside LAN), <code>untrust</code> (internet) aur <code>dmz</code> (public servers) hain. Naam sirf label hain jo aap chunte ho. Jo matter karta hai:</p>
<ul>
<li>Ek interface <b>sirf ek zone</b> mein ho sakta hai. Ek zone mein kai interfaces ho sakte hain.</li>
<li>Zone ka ek <b>type</b> hota hai jo uske interfaces ki deployment se milta hai: Layer 3, Layer 2, virtual wire, tap ya external. Layer 3 interface Layer 3 zone mein jaata hai.</li>
<li>Traffic ko <b>zone A se zone B</b> kehkar describe karte hain. Har session ka ek hi source zone aur ek hi destination zone hota hai.</li>
<li><b>Bina zone</b> ka interface koi traffic pass nahi karta. Firewall ke paas uske liye policy ki koi "jagah" nahi.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Zones aur interfaces">
<rect x="230" y="70" width="180" height="70" rx="10" fill="#ddd6fe"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="14">Firewall</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">zones ke beech policy</text>
<rect x="10" y="60" width="150" height="90" rx="10" fill="#bbf7d0"/><text x="85" y="88" text-anchor="middle" class="svg-ink" font-size="14">zone: trust</text><text x="85" y="110" text-anchor="middle" class="svg-muted" font-size="12">ethernet1/2</text><text x="85" y="130" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.0/24</text>
<rect x="480" y="10" width="150" height="80" rx="10" fill="#fde68a"/><text x="555" y="38" text-anchor="middle" class="svg-ink" font-size="14">zone: untrust</text><text x="555" y="60" text-anchor="middle" class="svg-muted" font-size="12">ethernet1/1</text><text x="555" y="78" text-anchor="middle" class="svg-muted" font-size="12">internet side</text>
<rect x="480" y="120" width="150" height="80" rx="10" fill="#fed7aa"/><text x="555" y="148" text-anchor="middle" class="svg-ink" font-size="14">zone: dmz</text><text x="555" y="170" text-anchor="middle" class="svg-muted" font-size="12">ethernet1/3</text><text x="555" y="188" text-anchor="middle" class="svg-muted" font-size="12">10.0.2.0/24</text>
<line x1="160" y1="105" x2="230" y2="105" stroke="#64748b" stroke-width="2"/><line x1="410" y1="85" x2="480" y2="55" stroke="#64748b" stroke-width="2"/><line x1="410" y1="125" x2="480" y2="155" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Rules zones ke beech likhe jaate hain, interfaces ke beech seedhe kabhi nahi.</p></div>

<h3>Do built-in default rules</h3>
<p>Har PAN-OS firewall ke security rulebase ke sabse neeche do predefined rules hote hain. Khali rulebase mein bhi unka asar dikhta hai:</p>
<ul>
<li><b>intrazone-default</b>: jo traffic <b>ek hi zone ke andar</b> rehta hai woh allowed hai.</li>
<li><b>interzone-default</b>: jo traffic <b>zones ke beech</b> jaata hai woh denied hai.</li>
</ul>
<p>Yaani bina rules ke ek zone ke hosts aapas mein khul kar baat karte hain aur zones ke beech kuch cross nahi karta. Yahi "zones ke beech default deny" posture hai. Simulator ise reproduce karta hai:</p>
<pre class="out">admin@PA1&gt; test security-policy-match from trust to trust source 10.0.1.10 destination 10.0.1.11 protocol 6 destination-port 80
<span class="hl">No rule matched. Traffic falls to the predefined "intrazone-default" rule (action allow).</span>

admin@PA1&gt; test security-policy-match from trust to untrust source 10.0.1.10 destination 8.8.8.8 protocol 6 destination-port 443
<span class="hl">No rule matched. Traffic falls to the predefined "interzone-default" rule (action deny).</span></pre>
<p>Dhyan rahe ki default deny by default log nahi karta, isliye teams aksar neeche explicit deny-all rule logging on karke jodti hain. Yeh aap pan-policy mein karoge.</p>

<h3>Bina zone wala interface kaisa dikhta hai</h3>
<p><code>show interface all</code> command har logical interface ko uske zone aur virtual router ke saath list karta hai. Yeh DMZ interface hai jab admin ne use IP de diya lekin zone aur router bhool gaya. Yahi pan-setup ke troubleshooting lab ki situation hai:</p>
<pre class="out">name                id    vsys zone             forwarding               tag    address
------------------- ----- ---- ---------------- ------------------------ ------ ------------------
ethernet1/1         16    1    untrust          vr:default               0      203.0.113.2/30
ethernet1/2         17    1    trust            vr:default               0      10.0.1.1/24
ethernet1/3         18    1    <span class="hl">N/A              N/A</span>                      0      10.0.2.1/24</pre>
<p>Zone <code>N/A</code> aur forwarding <code>N/A</code> ka matlab hai na zone na virtual router. IP configured hai, phir bhi kuch kaam nahi karta.</p>

<div class="eg"><p><b>Worked example.</b> Branch firewall mein ethernet1/2 <code>trust</code> mein, ethernet1/3 <code>dmz</code> mein, ethernet1/1 <code>untrust</code> mein hai. 10.0.1.10 ka PC DMZ server 10.0.2.10 ka page kholta hai. Firewall tay karta hai ki source zone trust hai (jis interface par packet aaya) aur destination zone dmz hai (routing se mila egress interface). Phir woh "from trust to dmz" rule dhoondhta hai. Zones interfaces aur routing table se aate hain, rule mein likhe IP addresses se kabhi nahi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Do unrelated networks ko ek zone mein daalna kyunki woh "milte-julte" lagte hain (phir intrazone-default unhe baat karne deta hai). Yeh bhool jaana ki destination zone route lookup se milta hai, isliye missing route confusing zone ya drop de sakta hai. Interface aur rule ke beech zone naam mein ek akshar ka fark: commit invalid reference ke saath fail hota hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Intrazone traffic by default allowed, interzone traffic by default denied. Doosra trap: exam rules ko "zone-based" bata kar poochh sakta hai ki rule kis object ke beech likha jaata hai. Jawab zones hai, interfaces ya VLANs nahi.</p></div>

<div class="scn"><h4>Contractor Wi-Fi jo servers tak pahunch gaya</h4><p>Ek site ne time bachane ke liye contractor Wi-Fi VLAN aur server VLAN dono ko ek hi <code>internal</code> zone mein daal diya. Intrazone traffic by default allowed hone ki wajah se contractor laptops bina kisi rule ke servers tak pahunch gaye, aur deny logs mein kuch dikha nahi. Fix: alag <code>contractors</code> zone aur ek explicit rule jo sirf zaroori applications allow kare.</p><p><b>Lesson:</b> zone ek trust boundary hai. Jin networks ko alag rehna chahiye unhe merge mat karo.</p></div>

<div class="iv"><p class="q">"Ek hi zone ke do interfaces ke beech traffic ka kya hota hai?"</p><p>Predefined intrazone-default rule use allow karta hai, isliye rule ki zaroorat nahi, jab tak aap us rule ko override na karo ya deny rule na jodo. Alag zones ke beech traffic interzone-default se denied hai jab tak aap allow na karo. Yeh batao ki predefined rules override karke default behaviour badal sakte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Zone interfaces ka named group hai; ek interface sirf ek zone mein hota hai.</li>
<li>Har session ka ek source zone aur ek destination zone hota hai.</li>
<li>Intrazone-default allow karta hai; interzone-default deny karta hai.</li>
<li>Bina zone ka interface N/A dikhata hai aur kuch pass nahi karta.</li>
<li>Destination zone routing lookup se aata hai.</li>
</ul></div>
`}};export{e as default};