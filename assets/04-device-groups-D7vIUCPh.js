var e={id:`device-groups`,h:{en:`Device groups, hierarchy and shared objects`,hi:`Device groups, hierarchy aur shared objects`},body:{en:`
<p>Where templates control how a firewall is built, <b>device groups</b> control what it allows. A device group is a set of firewalls and virtual systems that share policy rules and objects.</p>
<div class="note"><p><b>Note.</b> Reference material (not run in the simulator). Policy fundamentals are practised in pan-setup and pan-nat; this chapter adds the central-management layer.</p></div>
<h3>What a device group contains</h3>
<ul>
<li><b>Policies</b>: security, NAT, QoS, policy-based forwarding, decryption, application override, authentication and DoS rules.</li>
<li><b>Objects</b>: addresses, address groups, services, applications filters, tags, external dynamic lists, security profiles and profile groups, log forwarding profiles.</li>
</ul>
<p>A firewall belongs to one device group. A device group can have members in several sites.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Policy and objects are inherited downwards from Shared through parent to child device groups."><rect x="20" y="40" width="132" height="80" rx="10" fill="#bae6fd"/><text x="86" y="76" text-anchor="middle" class="svg-ink" font-size="14">Shared</text><text x="86" y="98" text-anchor="middle" class="svg-muted" font-size="12">all devices</text><line x1="152" y1="80" x2="176" y2="80" stroke="#64748b" stroke-width="2"/><rect x="176" y="40" width="132" height="80" rx="10" fill="#bbf7d0"/><text x="242" y="76" text-anchor="middle" class="svg-ink" font-size="14">Parent DG</text><text x="242" y="98" text-anchor="middle" class="svg-muted" font-size="12">Global-Branches</text><line x1="308" y1="80" x2="332" y2="80" stroke="#64748b" stroke-width="2"/><rect x="332" y="40" width="132" height="80" rx="10" fill="#ddd6fe"/><text x="398" y="76" text-anchor="middle" class="svg-ink" font-size="14">Child DG</text><text x="398" y="98" text-anchor="middle" class="svg-muted" font-size="12">EMEA</text><line x1="464" y1="80" x2="488" y2="80" stroke="#64748b" stroke-width="2"/><rect x="488" y="40" width="132" height="80" rx="10" fill="#fde68a"/><text x="554" y="76" text-anchor="middle" class="svg-ink" font-size="14">Firewall</text><text x="554" y="98" text-anchor="middle" class="svg-muted" font-size="12">in one DG</text></svg><p class="cap">Policy and objects are inherited downwards from Shared through parent to child device groups.</p></div>
<h3>The hierarchy</h3>
<p>Panorama has a top level called <b>Shared</b>, and device groups can be nested below it in parent and child relationships (several levels deep). Anything defined at a higher level is inherited by everything below.</p>
<ul>
<li><b>Shared</b>: objects and rules for the entire estate, such as company-wide address objects and a block-known-bad rule.</li>
<li><b>Parent device group</b> (for example Global-Branches): standards for all branches.</li>
<li><b>Child device group</b> (for example EMEA): rules and objects for that region only.</li>
<li><b>Firewall</b> membership: a firewall sits in one device group and inherits from all ancestors.</li>
</ul>
<p>Design the tree around how policy actually differs: by region, by function (branch, data centre) or by security level. A deep tree is harder to read. Two or three levels are enough for most estates.</p>
<h3>Object scope and precedence</h3>
<p>An object is available in the device group where it is defined and in all descendants. If a child group defines an object with the same name as one in an ancestor, the child's version is used for devices in the child, unless the ancestor object is set to disable override. Many teams keep unique names to avoid surprises: for example ADDR-NET-DC-APP rather than reusing a generic name.</p>
<ul>
<li>Put widely used objects in Shared.</li>
<li>Put region-specific objects in the child.</li>
<li>Use <b>tags</b> to colour and filter rules and objects.</li>
<li>Use <b>address groups</b> and <b>dynamic address groups</b> so rules do not list individual IPs.</li>
</ul>
<p>By default, Panorama pushes only objects that rules reference to the devices, which keeps firewall configuration smaller. A setting lets you share unused objects too; prefer the default for lean configuration.</p>
<h3>Device group membership versus template stack</h3>
<p>It is common to confuse the two. A firewall has one device group (policy) and one template stack (network and device settings). They are separate pushes and separate sync states. The security rule in the device group names a zone; that zone must exist in the firewall's template stack. This is the most frequent cause of commit errors.</p>
<h3>Multi-tenant note</h3>
<p>For managed security providers, device groups plus access domains separate customers: each customer's team sees only its own device group. Use separate shared objects only where it is safe, and do not place one customer's sensitive objects in Shared.</p>
<h3>Reference naming scheme</h3>
<ul>
<li>Device groups: DG-Global-Branches, DG-EMEA, DG-APAC.</li>
<li>Templates: T-Base-Network, T-Base-Device, T-Region-EMEA.</li>
<li>Template stacks: TS-EMEA-Branch.</li>
<li>Objects: ADDR-, SVC-, AG- and TAG- prefixes.</li>
</ul>
<p>Clear names turn troubleshooting from archaeology into reading.</p>
<div class="eg"><p><b>Worked example.</b> Shared holds ADDR-DNS-INTERNAL (192.0.2.53) and a rule that blocks a threat-feed list. DG-Global-Branches holds the branch baseline. DG-EMEA adds a rule allowing a regional SaaS service. A firewall in EMEA inherits all three; a firewall in APAC inherits only Shared and the baseline.</p></div>
<div class="warn"><p><b>Common mistake.</b> Defining the same object name at several levels with different values. The child silently overrides the parent and the rule behaves differently in different regions.</p></div>
<div class="exam"><p><b>Exam trap.</b> Objects and rules flow from Shared to parent to child. A firewall is in one device group. Panorama pushes referenced objects by default.</p></div>
<div class="scn"><h4>The same name, two meanings</h4><p>An address object named SERVER-A existed in Shared with one IP and in a child device group with another. The rule that used it allowed the wrong server in one region. Panorama showed the override; the team renamed the object with a regional prefix and removed the child copy.</p><p><b>Lesson:</b> unique, descriptive names remove a whole class of silent mistakes.</p></div>
<div class="iv"><p class="q">"How are device groups organised and how do objects inherit?"</p><p>Device groups form a tree under Shared. Rules and objects defined in a higher level are inherited by all lower levels, and a firewall belongs to one device group. Same-name objects in a child override those of the parent unless override is disabled, so use unique names.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Device groups hold policies and objects; a firewall has one.</li><li>Shared at the top, parents and children below; inheritance flows down.</li><li>Design the tree around real policy differences and keep it shallow.</li><li>Use unique object names, tags and groups instead of raw IPs.</li><li>A device group rule needs its zone to exist in the template stack.</li></ul></div>
`,hi:`
<p>Jahan templates control karte hain ki firewall kaise bana hai, wahan <b>device groups</b> control karte hain ki woh kya allow karta hai. Device group firewalls aur virtual systems ka set hai jo policy rules aur objects share karte hain.</p>
<div class="note"><p><b>Note.</b> Reference material (simulator mein nahi chalta). Policy fundamentals pan-setup aur pan-nat mein practise hote hain; yeh chapter central-management layer jodta hai.</p></div>
<h3>Device group mein kya hota hai</h3>
<ul>
<li><b>Policies</b>: security, NAT, QoS, policy-based forwarding, decryption, application override, authentication aur DoS rules.</li>
<li><b>Objects</b>: addresses, address groups, services, application filters, tags, external dynamic lists, security profiles aur profile groups, log forwarding profiles.</li>
</ul>
<p>Firewall ek hi device group ka hota hai. Device group ke members kai sites mein ho sakte hain.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Policy aur objects Shared se parent se child device groups tak neeche inherit hote hain."><rect x="20" y="40" width="132" height="80" rx="10" fill="#bae6fd"/><text x="86" y="76" text-anchor="middle" class="svg-ink" font-size="14">Shared</text><text x="86" y="98" text-anchor="middle" class="svg-muted" font-size="12">saare devices</text><line x1="152" y1="80" x2="176" y2="80" stroke="#64748b" stroke-width="2"/><rect x="176" y="40" width="132" height="80" rx="10" fill="#bbf7d0"/><text x="242" y="76" text-anchor="middle" class="svg-ink" font-size="14">Parent DG</text><text x="242" y="98" text-anchor="middle" class="svg-muted" font-size="12">Global-Branches</text><line x1="308" y1="80" x2="332" y2="80" stroke="#64748b" stroke-width="2"/><rect x="332" y="40" width="132" height="80" rx="10" fill="#ddd6fe"/><text x="398" y="76" text-anchor="middle" class="svg-ink" font-size="14">Child DG</text><text x="398" y="98" text-anchor="middle" class="svg-muted" font-size="12">EMEA</text><line x1="464" y1="80" x2="488" y2="80" stroke="#64748b" stroke-width="2"/><rect x="488" y="40" width="132" height="80" rx="10" fill="#fde68a"/><text x="554" y="76" text-anchor="middle" class="svg-ink" font-size="14">Firewall</text><text x="554" y="98" text-anchor="middle" class="svg-muted" font-size="12">ek DG mein</text></svg><p class="cap">Policy aur objects Shared se parent se child device groups tak neeche inherit hote hain.</p></div>
<h3>Hierarchy</h3>
<p>Panorama ka ek top level <b>Shared</b> hota hai, aur device groups uske neeche parent aur child relationship mein nested ho sakte hain (kai levels tak). Upar ke level par jo define ho woh neeche sab inherit karte hain.</p>
<ul>
<li><b>Shared</b>: poore estate ke objects aur rules, jaise company-wide address objects aur block-known-bad rule.</li>
<li><b>Parent device group</b> (jaise Global-Branches): saari branches ke standards.</li>
<li><b>Child device group</b> (jaise EMEA): sirf us region ki rules aur objects.</li>
<li><b>Firewall</b> membership: firewall ek device group mein baithta hai aur saare ancestors se inherit karta hai.</li>
</ul>
<p>Tree ko is hisaab se design karo ki policy asal mein kaise alag hoti hai: region se, function (branch, data centre) se ya security level se. Gehra tree padhna mushkil hota hai. Zyadatar estates ke liye do ya teen levels kaafi hain.</p>
<h3>Object scope aur precedence</h3>
<p>Object us device group mein available hai jahan define hua aur sab descendants mein. Child group ancestor ke object ke same naam ka object define kare to child ke devices ke liye child ka version use hota hai, jab tak ancestor object par disable override set na ho. Bahut se teams surprises se bachne ke liye unique names rakhte hain: jaise generic naam reuse karne ke bajay ADDR-NET-DC-APP.</p>
<ul>
<li>Zyada use hone wale objects Shared mein rakho.</li>
<li>Region-specific objects child mein rakho.</li>
<li>Rules aur objects ko colour aur filter karne ke liye <b>tags</b> use karo.</li>
<li>Rules mein individual IPs ke bajay <b>address groups</b> aur <b>dynamic address groups</b> use karo.</li>
</ul>
<p>Default mein Panorama devices ko sirf woh objects push karta hai jinhe rules reference karti hain, jisse firewall configuration chhota rehta hai. Ek setting unused objects bhi share karne deti hai; lean configuration ke liye default pasand karo.</p>
<h3>Device group membership versus template stack</h3>
<p>Dono ko confuse karna common hai. Firewall ka ek device group (policy) aur ek template stack (network aur device settings) hota hai. Yeh alag pushes aur alag sync states hain. Device group ki security rule ek zone ka naam leti hai; woh zone firewall ke template stack mein maujood hona chahiye. Commit errors ki sabse frequent wajah yahi hai.</p>
<h3>Multi-tenant note</h3>
<p>Managed security providers ke liye device groups plus access domains customers ko alag karte hain: har customer ki team sirf apna device group dekhti hai. Separate shared objects sirf wahan use karo jahan safe ho, aur ek customer ke sensitive objects Shared mein mat rakho.</p>
<h3>Reference naming scheme</h3>
<ul>
<li>Device groups: DG-Global-Branches, DG-EMEA, DG-APAC.</li>
<li>Templates: T-Base-Network, T-Base-Device, T-Region-EMEA.</li>
<li>Template stacks: TS-EMEA-Branch.</li>
<li>Objects: ADDR-, SVC-, AG- aur TAG- prefixes.</li>
</ul>
<p>Clear names troubleshooting ko archaeology se padhne mein badal dete hain.</p>
<div class="eg"><p><b>Worked example.</b> Shared mein ADDR-DNS-INTERNAL (192.0.2.53) aur threat-feed list block karne wali rule hai. DG-Global-Branches branch baseline rakhta hai. DG-EMEA ek regional SaaS service allow karne wali rule jodta hai. EMEA ka firewall teeno inherit karta hai; APAC ka firewall sirf Shared aur baseline.</p></div>
<div class="warn"><p><b>Common mistake.</b> Same object naam kai levels par alag values ke saath define karna. Child chupchap parent ko override karta hai aur rule alag regions mein alag behave karti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Objects aur rules Shared se parent se child tak flow karte hain. Firewall ek device group mein hota hai. Panorama default mein referenced objects push karta hai.</p></div>
<div class="scn"><h4>Same naam, do matlab</h4><p>SERVER-A naam ka address object Shared mein ek IP ke saath aur child device group mein doosre IP ke saath tha. Use karne wali rule ek region mein galat server allow kar rahi thi. Panorama ne override dikhaya; team ne object ko regional prefix ke saath rename kiya aur child copy hata di.</p><p><b>Lesson:</b> unique, descriptive names silent galtiyon ki poori class hata dete hain.</p></div>
<div class="iv"><p class="q">"Device groups kaise organise hote hain aur objects kaise inherit hote hain?"</p><p>Device groups Shared ke neeche tree banate hain. Upar ke level par define rules aur objects saare neeche ke levels inherit karte hain, aur firewall ek device group ka hota hai. Child ke same-name objects parent ke objects ko override karte hain jab tak override disable na ho, isliye unique names use karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Device groups policies aur objects rakhte hain; firewall ka ek hota hai.</li><li>Shared top par, parents aur children neeche; inheritance neeche flow karti hai.</li><li>Tree ko asli policy differences ke hisaab se design karo aur chhota rakho.</li><li>Raw IPs ke bajay unique object names, tags aur groups use karo.</li><li>Device group rule ke zone ka template stack mein hona zaroori hai.</li></ul></div>
`}};export{e as default};