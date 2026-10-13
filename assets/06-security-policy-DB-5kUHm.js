var e={id:`security-policy`,h:{en:`Security policy: zones, policy sets, stacks and rule order`,hi:`Security policy: zones, policy sets, stacks aur rule order`},body:{en:`
<p>The <b>security policy</b> of Prisma SD-WAN is the policy view of the zone-based firewall (ZBFW) that you met in the design module. This chapter turns the zone matrix into policy sets and stacks, explains the default rules, order of evaluation and binding, and shows how to avoid the usual mistakes. It belongs to <b>policy design: security</b>.</p>
<h3>Analogy: the badge reader at each door</h3>
<p>Every door in an office has a badge reader that checks three things: where you come from (source zone), where you are going (destination zone) and what you want to do (application). A security policy is the list of rules loaded into every badge reader, and the list is checked from top to bottom until one rule matches.</p>
<h3>What a security rule looks like</h3>
<p>The documentation describes a rule that allows or denies application access and traffic flow based on source and destination <b>zones</b> and <b>prefix filters</b>. In practice a rule has:</p>
<ul>
<li>a <b>source zone</b> and a <b>destination zone</b> (a zone maps to the networks on interfaces or sub-interfaces; typical zones are guest, corporate LAN, outside and corporate WAN);</li>
<li>optional <b>source and destination prefix filters</b> (global or local, with the security prefix type NGFW security);</li>
<li>an <b>application</b> or application group;</li>
<li>an <b>action</b>: allow or deny.</li>
</ul>
<h3>Default rules</h3>
<p>Every security policy set comes with three automatically generated default rules that cannot be edited: <b>self-zone</b>, <b>default</b> and <b>intra-zone</b>. When a stacked policy is created by cloning an original set, the documentation describes a Default Rule policy set with three rules named default-deny, intra-zone-allow and self-zone-allow. In plain words: traffic to the ION itself is handled by the self-zone rule, traffic within one zone is allowed by the intra-zone rule, and anything between zones that no rule allows is denied by the default. A Default Policy Set also gives baseline behaviour for public and private traffic when no user-defined set matches. The platform does not create a user-defined security policy set for you; you must create one.</p>
<h3>Sets, stacks and evaluation order</h3>
<table class="cmp"><tr><th>Item</th><th>Facts</th></tr>
<tr><td><b>Simple stack</b></td><td>One policy set; the documentation suggests it for fewer than 50 rules and small branches with consistent needs</td></tr>
<tr><td><b>Advanced stack</b></td><td>Up to four user-defined sets plus the Default Policy Set; evaluated left to right, rules top to bottom, and evaluation stops at the first match</td></tr>
<tr><td><b>Binding</b></td><td>A stack must be bound to a site to become active; one security stack per site at a time; several sites can use the same stack</td></tr>
<tr><td><b>Loading</b></td><td>After binding, policy loads in about one to two seconds, and existing connections continue uninterrupted</td></tr>
<tr><td><b>Removal</b></td><td>A set cannot be removed while sites use it</td></tr></table>
<p>The recommended order in an advanced stack is most specific to most general. A sensible layout: first a set for time-sensitive and special-case applications, then standard business applications, then general access, and finally exceptions and denies. For Harbor Foods, set 1 is PAYMENT (strict), set 2 is CORPORATE, set 3 is GUEST, and the default set closes the stack.</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Security stack evaluation">
<rect x="10" y="20" width="140" height="80" rx="10" fill="#fde68a"/><text x="80" y="50" text-anchor="middle" class="svg-ink" font-size="13">Set 1: PAYMENT</text><text x="80" y="70" text-anchor="middle" class="svg-muted" font-size="11">rules top to bottom</text>
<rect x="170" y="20" width="140" height="80" rx="10" fill="#bbf7d0"/><text x="240" y="50" text-anchor="middle" class="svg-ink" font-size="13">Set 2: CORPORATE</text><text x="240" y="70" text-anchor="middle" class="svg-muted" font-size="11">rules top to bottom</text>
<rect x="330" y="20" width="140" height="80" rx="10" fill="#fed7aa"/><text x="400" y="50" text-anchor="middle" class="svg-ink" font-size="13">Set 3: GUEST</text><text x="400" y="70" text-anchor="middle" class="svg-muted" font-size="11">rules top to bottom</text>
<rect x="490" y="20" width="140" height="80" rx="10" fill="#e2e8f0"/><text x="560" y="50" text-anchor="middle" class="svg-ink" font-size="13">Default set</text><text x="560" y="70" text-anchor="middle" class="svg-muted" font-size="11">self, intra, default</text>
<line x1="150" y1="60" x2="170" y2="60" stroke="#64748b" stroke-width="2"/><line x1="310" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><line x1="470" y1="60" x2="490" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">Evaluated left to right; first match wins</text>
<rect x="10" y="160" width="620" height="70" rx="10" fill="#bae6fd"/><text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="13">Stack bound to the site (one security stack per site)</text><text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="11">same stack can be bound to many sites</text>
</svg><p class="cap">An advanced security stack with three user-defined sets and the default set.</p></div>
<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! Design table for the PAYMENT set. Not device commands.</span>
Order  Source zone  Dest zone   Prefix filter (dest)         Application        Action
  10   Payment      WAN         Gateway-Servers (global)     Payment-Gateway    allow
  20   Payment      WAN         any                          any                deny
  30   Payment      Outside     any                          any                deny
  40   Payment      Payment     any                          any                allow  (intra-zone)</pre>
<h3>Prefix filters in security policy</h3>
<p>Prefix filters restrict access within branches and remove traffic to specific addresses between zones. Global prefixes carry the same ranges everywhere; local prefixes differ per site and must be attached to sites to work. The documentation warns that large prefix lists are not recommended because they can exhaust ION memory and cause out-of-memory failures. Summarise to subnets and use zones for the bulk of the logic: the documentation says that creating more than five or six zones usually means overlapping requirements, and prefix filters inside existing zones are the better tool.</p>
<h3>Portal walk-through (not run in the simulator)</h3>
<p>The documentation describes creating a security policy set and rules under the security policy area of the portal, creating zones and binding them to the interface networks, creating a security policy stack and then binding the stack to sites ("Security stacks must be bound to sites to become active"). Design-time deliverable: for every site type, the list of zones, the interface or VLAN each zone is bound to, the stack name and the sites that use it.</p>
<div class="eg"><p><b>Worked example: evaluating a flow.</b> A payment terminal at 10.110.30.21 contacts the gateway at 10.20.60.5 (documentation examples). Source zone Payment, destination zone WAN. Set 1 rule 10 matches (destination in Gateway-Servers, application Payment-Gateway): allow, evaluation stops. A different flow from the same terminal to the internet matches rule 30: deny. A guest laptop to the payment terminal skips set 1 (source zone does not match), set 2 and set 3 have no allow between guest and payment, and the default set denies it.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Creating a zone and forgetting to bind it, which blocks traffic on unbound interfaces. Expecting the platform to create a default security set. Assuming rules in different sets are all evaluated; evaluation stops at the first match. Putting a broad allow in an early set that makes later denies unreachable. More than one active stack per site is not possible.</p></div>
<div class="exam"><p><b>Exam trap.</b> Three default rules (self-zone, default, intra-zone) cannot be edited. Simple stack: one set, fewer than 50 rules suggested. Advanced stack: up to four user-defined sets plus the default set, left to right, first match wins. One security stack per site. Stack must be bound to a site.</p></div>
<div class="scn"><h4>The shadowed deny</h4><p>A team added a deny rule for the guest zone in the third set, but guests could still reach an internal printer. In the first set, a broad allow for source zone corporate WAN and destination any application matched the guest-to-printer flow earlier because the printer sat in a shared zone. Moving the deny into the first set above the allow, and narrowing the allow to the print prefix, fixed it.</p><p><b>Lesson:</b> first match wins, so order sets and rules from most specific to most general.</p></div>
<div class="iv"><p class="q">"How is a security policy evaluated on an ION with an advanced stack?"</p><p>The stack holds up to four user-defined sets and the default set. The ION evaluates sets left to right and rules top to bottom inside each set, using source and destination zones, prefix filters and application, and it stops at the first match. Three non-editable default rules handle self-zone, intra-zone and default-deny. The stack is bound to the site, and only one security stack is active per site.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A security rule matches source and destination zones, prefix filters and application, with allow or deny.</li>
<li>Each set has three non-editable default rules; you must create your own sets.</li>
<li>Advanced stacks hold up to four sets plus default; first match wins; order specific to general.</li>
<li>One security stack per site; bind it, and expect about a one to two second load without breaking sessions.</li>
<li>Prefer few zones and summarised prefix filters; large lists can exhaust memory.</li>
</ul></div>
`,hi:`
<p>Prisma SD-WAN ki <b>security policy</b> us zone-based firewall (ZBFW) ka policy view hai jo aap design module mein mile the. Yeh chapter zone matrix ko policy sets aur stacks mein badalta hai, default rules, evaluation order aur binding samjhata hai, aur dikhata hai ki aam galtiyon se kaise bachein. Yeh <b>policy design: security</b> ka hissa hai.</p>
<h3>Analogy: har darwaze par badge reader</h3>
<p>Office ke har darwaze par badge reader teen cheezein check karta hai: aap kahan se aa rahe ho (source zone), kahan ja rahe ho (destination zone) aur kya karna chahte ho (application). Security policy woh rules ki list hai jo har badge reader mein load hoti hai, aur list upar se neeche tab tak check hoti hai jab tak koi rule match na ho.</p>
<h3>Security rule kaisa dikhta hai</h3>
<p>Documentation ek aise rule ko describe karti hai jo source aur destination <b>zones</b> aur <b>prefix filters</b> ke hisaab se application access aur traffic flow allow ya deny karta hai. Practice mein rule mein hota hai:</p>
<ul>
<li>ek <b>source zone</b> aur ek <b>destination zone</b> (zone interfaces ya sub-interfaces ke networks se map hota hai; typical zones guest, corporate LAN, outside aur corporate WAN hain);</li>
<li>optional <b>source aur destination prefix filters</b> (global ya local, security prefix type NGFW security ke saath);</li>
<li>ek <b>application</b> ya application group;</li>
<li>ek <b>action</b>: allow ya deny.</li>
</ul>
<h3>Default rules</h3>
<p>Har security policy set ke saath teen automatically generated default rules aate hain jo edit nahi ho sakte: <b>self-zone</b>, <b>default</b> aur <b>intra-zone</b>. Jab original set clone karke stacked policy banti hai, documentation ek Default Rule policy set describe karti hai jisme teen rules hote hain: default-deny, intra-zone-allow aur self-zone-allow. Seedhe shabdon mein: ION ke khud ke traffic ko self-zone rule handle karta hai, ek zone ke andar ka traffic intra-zone rule se allow hota hai, aur zones ke beech jo traffic koi rule allow nahi karta use default deny karta hai. Default Policy Set public aur private traffic ke liye baseline behaviour bhi deta hai jab koi user-defined set match na kare. Platform aapke liye user-defined security policy set nahi banata; aapko khud banana padta hai.</p>
<h3>Sets, stacks aur evaluation order</h3>
<table class="cmp"><tr><th>Item</th><th>Facts</th></tr>
<tr><td><b>Simple stack</b></td><td>Ek policy set; documentation 50 se kam rules aur consistent needs wali chhoti branches ke liye suggest karti hai</td></tr>
<tr><td><b>Advanced stack</b></td><td>Chaar tak user-defined sets plus Default Policy Set; left se right, rules upar se neeche evaluate hote hain, aur pehle match par evaluation ruk jaata hai</td></tr>
<tr><td><b>Binding</b></td><td>Stack ko active hone ke liye site se bind karna padta hai; ek samay mein har site par ek security stack; kai sites ek hi stack use kar sakti hain</td></tr>
<tr><td><b>Loading</b></td><td>Binding ke baad policy lagbhag ek se do second mein load hoti hai, aur existing connections bina rukavat chalte rehte hain</td></tr>
<tr><td><b>Removal</b></td><td>Jab tak sites set use kar rahi hon, set remove nahi ho sakta</td></tr></table>
<p>Advanced stack mein recommended order sabse specific se sabse general hai. Achha layout: pehle time-sensitive aur special-case applications ka set, phir standard business applications, phir general access, aur aakhir mein exceptions aur denies. Harbor Foods ke liye set 1 PAYMENT (strict), set 2 CORPORATE, set 3 GUEST hai, aur default set stack ko band karta hai.</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Security stack evaluation">
<rect x="10" y="20" width="140" height="80" rx="10" fill="#fde68a"/><text x="80" y="50" text-anchor="middle" class="svg-ink" font-size="13">Set 1: PAYMENT</text><text x="80" y="70" text-anchor="middle" class="svg-muted" font-size="11">rules upar se neeche</text>
<rect x="170" y="20" width="140" height="80" rx="10" fill="#bbf7d0"/><text x="240" y="50" text-anchor="middle" class="svg-ink" font-size="13">Set 2: CORPORATE</text><text x="240" y="70" text-anchor="middle" class="svg-muted" font-size="11">rules upar se neeche</text>
<rect x="330" y="20" width="140" height="80" rx="10" fill="#fed7aa"/><text x="400" y="50" text-anchor="middle" class="svg-ink" font-size="13">Set 3: GUEST</text><text x="400" y="70" text-anchor="middle" class="svg-muted" font-size="11">rules upar se neeche</text>
<rect x="490" y="20" width="140" height="80" rx="10" fill="#e2e8f0"/><text x="560" y="50" text-anchor="middle" class="svg-ink" font-size="13">Default set</text><text x="560" y="70" text-anchor="middle" class="svg-muted" font-size="11">self, intra, default</text>
<line x1="150" y1="60" x2="170" y2="60" stroke="#64748b" stroke-width="2"/><line x1="310" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><line x1="470" y1="60" x2="490" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">Left se right evaluate; pehla match jeetta hai</text>
<rect x="10" y="160" width="620" height="70" rx="10" fill="#bae6fd"/><text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="13">Stack site se bound (har site par ek security stack)</text><text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="11">ek hi stack kai sites se bound ho sakta hai</text>
</svg><p class="cap">Teen user-defined sets aur default set wala advanced security stack.</p></div>
<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! PAYMENT set ki design table. Device commands nahi.</span>
Order  Source zone  Dest zone   Prefix filter (dest)         Application        Action
  10   Payment      WAN         Gateway-Servers (global)     Payment-Gateway    allow
  20   Payment      WAN         any                          any                deny
  30   Payment      Outside     any                          any                deny
  40   Payment      Payment     any                          any                allow  (intra-zone)</pre>
<h3>Security policy mein prefix filters</h3>
<p>Prefix filters branches ke andar access restrict karte hain aur zones ke beech specific addresses ka traffic hata dete hain. Global prefixes har jagah same ranges rakhte hain; local prefixes site ke hisaab se alag hote hain aur kaam karne ke liye sites se attach karne padte hain. Documentation chetavani deti hai ki bade prefix lists recommended nahi hain kyunki woh ION memory khatam karke out-of-memory failures la sakte hain. Subnets mein summarise karo aur zyada logic ke liye zones use karo: documentation kehti hai ki paanch ya chhe se zyada zones banana aam taur par overlapping requirements batata hai, aur existing zones ke andar prefix filters behtar tool hain.</p>
<h3>Portal walk-through (not run in the simulator)</h3>
<p>Documentation portal ke security policy area mein security policy set aur rules banana, zones banakar unhe interface networks se bind karna, security policy stack banana aur phir stack ko sites se bind karna describe karti hai ("Security stacks must be bound to sites to become active"). Design-time deliverable: har site type ke liye zones ki list, har zone kis interface ya VLAN se bound hai, stack ka naam aur use karne wali sites.</p>
<div class="eg"><p><b>Worked example: flow evaluate karna.</b> 10.110.30.21 par payment terminal 10.20.60.5 par gateway se contact karta hai (documentation examples). Source zone Payment, destination zone WAN. Set 1 ka rule 10 match karta hai (destination Gateway-Servers mein, application Payment-Gateway): allow, evaluation ruk jaata hai. Usi terminal se internet ka doosra flow rule 30 se match hota hai: deny. Guest laptop se payment terminal tak flow set 1 ko skip karta hai (source zone match nahi), set 2 aur set 3 mein guest aur payment ke beech allow nahi hai, aur default set use deny karta hai.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> Zone banana aur bind karna bhool jaana, jisse unbound interfaces ka traffic block hota hai. Platform se default security set banane ki umeed rakhna. Yeh maanna ki alag sets ke saare rules evaluate hote hain; evaluation pehle match par ruk jaata hai. Early set mein broad allow jo baad ke denies ko unreachable bana de. Ek site par ek se zyada active stack possible nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Teen default rules (self-zone, default, intra-zone) edit nahi ho sakte. Simple stack: ek set, 50 se kam rules suggested. Advanced stack: chaar tak user-defined sets plus default set, left se right, pehla match jeetta hai. Har site par ek security stack. Stack ko site se bind karna zaroori.</p></div>
<div class="scn"><h4>Shadowed deny</h4><p>Ek team ne guest zone ke liye teesre set mein deny rule add kiya, par guests phir bhi internal printer tak pahunch sakte the. Pehle set mein source zone corporate WAN aur destination any application ka broad allow guest-to-printer flow ko pehle match kar raha tha kyunki printer shared zone mein tha. Deny ko allow ke upar pehle set mein le jaane aur allow ko print prefix tak narrow karne se fix hua.</p><p><b>Seekh:</b> pehla match jeetta hai, isliye sets aur rules ko sabse specific se sabse general order mein rakho.</p></div>
<div class="iv"><p class="q">"Advanced stack wale ION par security policy kaise evaluate hoti hai?"</p><p>Stack mein chaar tak user-defined sets aur default set hote hain. ION sets ko left se right aur har set ke andar rules ko upar se neeche, source aur destination zones, prefix filters aur application ke saath evaluate karta hai, aur pehle match par ruk jaata hai. Teen non-editable default rules self-zone, intra-zone aur default-deny handle karte hain. Stack site se bound hota hai, aur har site par sirf ek security stack active hota hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Security rule source aur destination zones, prefix filters aur application match karta hai, allow ya deny ke saath.</li>
<li>Har set mein teen non-editable default rules hote hain; apne sets khud banane padte hain.</li>
<li>Advanced stacks mein chaar tak sets plus default; pehla match jeetta hai; specific se general order.</li>
<li>Har site par ek security stack; bind karo, aur sessions toote bina lagbhag ek se do second load expect karo.</li>
<li>Kam zones aur summarised prefix filters pasand karo; bade lists memory khatam kar sakte hain.</li>
</ul></div>
`}};export{e as default};