var e={id:`nat-policy`,h:{en:`NAT policy in device groups`,hi:`Device groups mein NAT policy`},body:{en:`
<p><b>Analogy.</b> Your office uses private room numbers inside the building (101, 102). When a courier delivers a parcel to the street, everything goes out under the company's single street address. The gate desk keeps a note of which room sent which parcel, so replies come back to the right room. That desk is <b>NAT</b>: Network Address Translation, rewriting the private source address to a public one on the way out.</p>

<h3>Why NAT is a separate rulebase</h3>
<p>A firewall has two independent rulebases. The <b>security</b> rulebase decides <i>allow or deny</i>. The <b>NAT</b> rulebase decides <i>how addresses are rewritten</i>. A packet is permitted by security policy and translated by NAT policy; one does not replace the other. A very common beginner fault is a perfect NAT rule and a missing allow rule, or the reverse.</p>

<h3>NAT in a device group</h3>
<p>Like security rules, NAT rules can be pre-rules or post-rules in a device group or Shared, and they follow the same order: Shared pre, parent pre, child pre, local, child post, parent post, Shared post. In the course lab NAT is managed centrally only through device-group NAT rules, and the push sends them together with the security policy.</p>
<pre class="code"><span class="c">! Source NAT for the whole group (illustration; the lab pushes this kind of rule too)</span>
admin@NK-PANORAMA# set device-group NK-BRANCHES pre-rulebase nat rules NAT-Std-Out from trust to untrust source any destination any service any source-translation dynamic-ip-and-port interface-address interface ethernet1/1
admin@NK-PANORAMA# commit</pre>
<p>Reading this left to right: for traffic from zone trust to zone untrust, from any source to any destination and any service, translate the source with <b>dynamic IP and port</b> (many private hosts share one public address, distinguished by port) using the address of interface ethernet1/1. Because the translation uses the interface address, the same rule works on every firewall: Pune gets 203.0.113.2, Delhi 203.0.113.6, Chennai 203.0.113.10, each from its own interface. That is why an interface-based NAT rule is such a good fit for a group.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Source NAT with interface address">
<rect x="10" y="40" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="75" y="62" text-anchor="middle" class="svg-ink" font-size="13">PC 10.1.1.10</text><text x="75" y="78" text-anchor="middle" class="svg-muted" font-size="12">private source</text>
<rect x="200" y="30" width="240" height="70" rx="8" fill="#bae6fd"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="13">Firewall</text><text x="320" y="73" text-anchor="middle" class="svg-muted" font-size="12">security: allow? NAT: rewrite source</text><text x="320" y="89" text-anchor="middle" class="svg-muted" font-size="12">to ethernet1/1 address</text>
<rect x="500" y="40" width="130" height="50" rx="8" fill="#fde68a"/><text x="565" y="62" text-anchor="middle" class="svg-ink" font-size="13">INET-SRV 8.8.8.8</text><text x="565" y="78" text-anchor="middle" class="svg-muted" font-size="12">sees the public IP</text>
<line x1="140" y1="65" x2="200" y2="65" stroke="#64748b"/><line x1="440" y1="65" x2="500" y2="65" stroke="#64748b"/>
<text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="12">Two decisions: security allows the session; NAT changes the source address.</text>
</svg><p class="cap">Security and NAT are separate steps on the same firewall.</p></div>

<h3>Checking NAT</h3>
<p>On the firewall, the NAT view lists each rule with its translation:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show running nat-policy
"NAT-Std-Out; index: 1" {
        nat-type ipv4;
        from trust;
        source any;
        to untrust;
        destination any;
        service any;
        translate-to "src: ethernet1/1 203.0.113.2 (dynamic-ip-and-port)";
        terminal no;
}</pre>
<p>If you see no rule, or the translated address is not what you expect, the NAT rule did not arrive (push not done, or not committed), or the interface has a different address than you assumed.</p>

<div class="eg"><p><b>Worked example.</b> A branch complains "the Internet does not work, but the allow rule is there." You check security (allowed, fine) and then NAT: the list is empty on that firewall. The NAT pre-rule had been committed on Panorama but the device group was not pushed after the commit. After the push, the same command shows the translation and users can browse.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Writing NAT rules but no security allow (or the reverse); hard-coding a public address in a group rule when each site has a different one (use the interface address); forgetting that the security rule matches on the pre-NAT address and the destination zone of the real route.</p></div>
<div class="exam"><p><b>Exam trap.</b> NAT and security are two rulebases. Both must permit the flow. NAT rules in device groups follow the same pre, local, post order as security rules.</p></div>

<div class="scn"><h4>One NAT rule, thirty sites</h4><p>A retailer had a unique source-NAT rule on each store firewall, each typed by hand with the store's public address. A group NAT pre-rule using the WAN interface address replaced thirty rules. When one store changed its ISP address, nothing needed editing, because the rule used the interface address.</p><p><b>Lesson:</b> interface-based translation scales with a device group.</p></div>

<div class="iv"><p class="q">"Where do you manage NAT when you have many branches, and what do you watch for?"</p><p>As NAT pre-rules in the device group, using interface-address source translation so each site uses its own WAN address. I remember that NAT and security are separate rulebases, so I also confirm an allow rule exists, and I verify on a firewall with the NAT view after the push.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT rewrites addresses; security allows or denies. Both are needed.</li>
<li>Device-group NAT rules use pre and post positions like security rules.</li>
<li>Interface-address translation lets one rule serve many firewalls.</li>
<li>After a push, verify the NAT rule and translated address on the firewall.</li>
<li>In the course lab NAT is centrally managed only as device-group rules.</li>
</ul></div>
`,hi:`
<p><b>Analogy.</b> Aapka office building ke andar private room numbers use karta hai (101, 102). Jab courier street par parcel deta hai to sab company ke ek street address se jata hai. Gate desk note rakhta hai ki kaunse room ne kaunsa parcel bheja, taaki replies sahi room tak aayein. Wo desk <b>NAT</b> hai: Network Address Translation, jata hua private source address ko public address mein badalna.</p>

<h3>NAT alag rulebase kyun hai</h3>
<p>Firewall ke do independent rulebases hote hain. <b>Security</b> rulebase <i>allow ya deny</i> decide karta hai. <b>NAT</b> rulebase decide karta hai <i>addresses kaise rewrite hon</i>. Packet security policy se permit hota hai aur NAT policy se translate; ek doosre ki jagah nahi leta. Beginners ki sabse common galti: perfect NAT rule aur allow rule missing, ya ulta.</p>

<h3>Device group mein NAT</h3>
<p>Security rules ki tarah NAT rules bhi device group ya Shared mein pre-rules ya post-rules ho sakti hain, aur wahi order follow karti hain: Shared pre, parent pre, child pre, local, child post, parent post, Shared post. Course lab mein NAT sirf device-group NAT rules se centrally manage hota hai, aur push unhe security policy ke saath bhejta hai.</p>
<pre class="code"><span class="c">! Poore group ke liye source NAT (illustration; lab bhi is tarah ki rule push karta hai)</span>
admin@NK-PANORAMA# set device-group NK-BRANCHES pre-rulebase nat rules NAT-Std-Out from trust to untrust source any destination any service any source-translation dynamic-ip-and-port interface-address interface ethernet1/1
admin@NK-PANORAMA# commit</pre>
<p>Left se right padho: zone trust se zone untrust ka traffic, kisi bhi source se kisi bhi destination tak aur kisi bhi service par, source ko <b>dynamic IP and port</b> se translate karo (kai private hosts ek public address share karte hain, port se alag pehchane jaate hain) interface ethernet1/1 ke address se. Translation interface address use karti hai, isliye wahi rule har firewall par chalti hai: Pune ko 203.0.113.2, Delhi ko 203.0.113.6, Chennai ko 203.0.113.10, har ek apne interface se. Isiliye interface-based NAT rule group ke liye itni achhi fit hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Source NAT with interface address">
<rect x="10" y="40" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="75" y="62" text-anchor="middle" class="svg-ink" font-size="13">PC 10.1.1.10</text><text x="75" y="78" text-anchor="middle" class="svg-muted" font-size="12">private source</text>
<rect x="200" y="30" width="240" height="70" rx="8" fill="#bae6fd"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="13">Firewall</text><text x="320" y="73" text-anchor="middle" class="svg-muted" font-size="12">security: allow? NAT: source rewrite</text><text x="320" y="89" text-anchor="middle" class="svg-muted" font-size="12">ethernet1/1 address mein</text>
<rect x="500" y="40" width="130" height="50" rx="8" fill="#fde68a"/><text x="565" y="62" text-anchor="middle" class="svg-ink" font-size="13">INET-SRV 8.8.8.8</text><text x="565" y="78" text-anchor="middle" class="svg-muted" font-size="12">public IP dekhta hai</text>
<line x1="140" y1="65" x2="200" y2="65" stroke="#64748b"/><line x1="440" y1="65" x2="500" y2="65" stroke="#64748b"/>
<text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="12">Do decisions: security session allow karti hai; NAT source address badalta hai.</text>
</svg><p class="cap">Security aur NAT ek hi firewall par alag steps hain.</p></div>

<h3>NAT check karna</h3>
<p>Firewall par NAT view har rule ko uski translation ke saath list karta hai:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show running nat-policy
"NAT-Std-Out; index: 1" {
        nat-type ipv4;
        from trust;
        source any;
        to untrust;
        destination any;
        service any;
        translate-to "src: ethernet1/1 203.0.113.2 (dynamic-ip-and-port)";
        terminal no;
}</pre>
<p>Agar koi rule nahi dikhti, ya translated address expected nahi hai, to NAT rule pahunchi hi nahi (push nahi hua, ya commit nahi hua), ya interface ka address aapki assumption se alag hai.</p>

<div class="eg"><p><b>Worked example.</b> Branch shikayat karti hai "Internet nahi chal raha, jabki allow rule hai." Aap security check karte ho (allowed, theek) phir NAT: us firewall par list khali hai. NAT pre-rule Panorama par commit ho gayi thi par commit ke baad device group push nahi hua tha. Push ke baad wahi command translation dikhata hai aur users browse kar paate hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> NAT rules likhna par security allow nahi (ya ulta); jab har site ka public address alag ho tab group rule mein public address hard-code karna (interface address use karo); ye bhoolna ki security rule pre-NAT address aur real route ke destination zone par match karti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> NAT aur security do rulebases hain. Dono flow ko permit karein. Device groups ki NAT rules bhi security rules jaisa pre, local, post order follow karti hain.</p></div>

<div class="scn"><h4>Ek NAT rule, tees sites</h4><p>Ek retailer ke har store firewall par unique source-NAT rule thi, har ek store ke public address ke saath haath se type ki hui. WAN interface address use karne wali group NAT pre-rule ne tees rules ki jagah le li. Jab ek store ka ISP address badla, kuch edit nahi karna pada, kyunki rule interface address use karti thi.</p><p><b>Lesson:</b> interface-based translation device group ke saath scale hoti hai.</p></div>

<div class="iv"><p class="q">"Kai branches hon to NAT kahan manage karoge, aur kya dhyan rakhoge?"</p><p>Device group mein NAT pre-rules ki tarah, interface-address source translation ke saath taaki har site apna WAN address use kare. Yaad rakhta hoon ki NAT aur security alag rulebases hain, isliye allow rule bhi confirm karta hoon, aur push ke baad NAT view se firewall par verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT addresses rewrite karta hai; security allow ya deny karti hai. Dono chahiye.</li>
<li>Device-group NAT rules security rules ki tarah pre aur post positions use karti hain.</li>
<li>Interface-address translation se ek rule kai firewalls ko serve karti hai.</li>
<li>Push ke baad firewall par NAT rule aur translated address verify karo.</li>
<li>Course lab mein NAT sirf device-group rules ke roop mein centrally manage hota hai.</li>
</ul></div>
`}};export{e as default};