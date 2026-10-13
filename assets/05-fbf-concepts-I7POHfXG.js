var e={id:`fbf-concepts`,h:{en:`Filter-based forwarding: concepts`,hi:`Filter-based forwarding: concepts`},body:{en:`
<p>Normal routing is <b>destination based</b>: the router looks at the destination address, finds the longest prefix and forwards. That means every user going to the same server takes the same path. Sometimes the business wants something else: the training lab should use the cheap ISP, the finance VLAN should use the premium link, or a monitoring subnet must leave through a specific firewall. The deciding factor is the <b>source</b>, not the destination. Junos solves this with <b>filter-based forwarding</b> (FBF).</p>

<h3>The idea</h3>
<p>A firewall filter is applied to an <b>input</b> interface. A term matches the source subnet and its action is <code>then routing-instance NAME</code>. Matching packets are looked up in the table of that instance instead of <code>inet.0</code>. Non-matching packets follow the normal path.</p>

<div class="dia"><svg viewBox="0 0 660 230" role="img" aria-label="FBF flow">
<rect x="20" y="85" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="65" y="115" text-anchor="middle" class="svg-ink" font-size="12">Lab PC</text>
<rect x="150" y="70" width="130" height="80" rx="10" fill="#bae6fd"/><text x="215" y="100" text-anchor="middle" class="svg-ink" font-size="13">input filter</text><text x="215" y="122" text-anchor="middle" class="svg-muted" font-size="11">on ge-0/0/3.0</text>
<rect x="400" y="20" width="140" height="55" rx="8" fill="#bbf7d0"/><text x="470" y="42" text-anchor="middle" class="svg-ink" font-size="12">ISP-B.inet.0</text><text x="470" y="62" text-anchor="middle" class="svg-muted" font-size="11">term LAB matched</text>
<rect x="400" y="140" width="140" height="55" rx="8" fill="#fde68a"/><text x="470" y="162" text-anchor="middle" class="svg-ink" font-size="12">inet.0</text><text x="470" y="182" text-anchor="middle" class="svg-muted" font-size="11">everything else</text>
<line x1="110" y1="110" x2="150" y2="110" stroke="#64748b" stroke-width="2"/><line x1="280" y1="95" x2="400" y2="50" stroke="#16a34a" stroke-width="3"/><line x1="280" y1="125" x2="400" y2="165" stroke="#64748b" stroke-width="2"/>
<text x="590" y="52" class="svg-accent" font-size="12">ISP-B</text><text x="590" y="170" class="svg-muted" font-size="12">ISP-A</text>
</svg><p class="cap">The filter picks the table; the table picks the next hop.</p></div>

<h3>The four building blocks</h3>
<ol>
<li><b>A forwarding instance</b> that holds the alternative route: <code>instance-type forwarding</code> with a static default to the second ISP.</li>
<li><b>A RIB group</b> that copies the interface routes into the instance so that the next hop resolves.</li>
<li><b>A firewall filter</b> with a term that matches the source and sets <code>routing-instance</code>, plus a <b>final term that accepts</b> everything else.</li>
<li><b>Application of the filter</b> as <code>input</code> on the interface where the traffic enters.</li>
</ol>
<pre class="code">set routing-instances ISP-B instance-type forwarding
set routing-instances ISP-B routing-options static route 0.0.0.0/0 next-hop 10.0.2.2
set routing-options rib-groups FBF-RG import-rib [ inet.0 ISP-B.inet.0 ]
set routing-options interface-routes rib-group inet FBF-RG
set firewall family inet filter STEER-LAB term LAB from source-address 10.1.2.0/24
set firewall family inet filter STEER-LAB term LAB then routing-instance ISP-B
set firewall family inet filter STEER-LAB term REST then accept
set interfaces ge-0/0/3 unit 0 family inet filter input STEER-LAB</pre>

<h3>Why the last term matters</h3>
<p>A Junos firewall filter ends with an <b>implicit discard</b>. If a packet matches no term, it is dropped. Without <code>term REST then accept</code>, every packet that is not from the lab subnet would be silently discarded, and the staff on the same interface would lose connectivity. This is the number one mistake with FBF.</p>

<h3>Order of processing</h3>
<ol>
<li>The packet enters an interface with an input filter.</li>
<li>The filter terms run in order. The first matching term decides.</li>
<li>If the action is <code>routing-instance NAME</code>, the destination lookup uses <code>NAME.inet.0</code>.</li>
<li>If the action is <code>accept</code>, the normal lookup in <code>inet.0</code> happens.</li>
</ol>
<p>The filter is evaluated only for packets <i>entering</i> the interface. Return traffic coming from the Internet has its own path. Make sure the ISP returns replies through the same provider, or the lab reply will arrive through the wrong ISP and be dropped by a stateful device.</p>

<h3>Why a forwarding instance, not a virtual router?</h3>
<p>The target only needs routes to forward packets. It does not run OSPF or BGP. A <b>forwarding</b> instance is lighter and exists exactly for this purpose. Using a virtual router would also work, but the exam expects <code>instance-type forwarding</code>.</p>

<table class="cmp"><tr><th>Question</th><th>Destination routing</th><th>Filter-based forwarding</th></tr>
<tr><td>Decision factor</td><td>Destination prefix</td><td>Any filter match, such as source address</td></tr>
<tr><td>Where configured</td><td>Routing table</td><td>Input firewall filter</td></tr>
<tr><td>Tables involved</td><td>inet.0</td><td>inet.0 and a forwarding instance</td></tr>
<tr><td>Default for unmatched traffic</td><td>n/a</td><td>implicit discard unless accepted</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A school has two ISPs. The lab subnet 10.1.2.0/24 must use ISP-B, the staff subnet 10.1.1.0/24 ISP-A. The filter STEER-LAB on the lab-side interface sends lab packets to ISP-B.inet.0. Staff packets arrive on a different interface that has no filter and use inet.0 with its default route to ISP-A.</p></div>
<div class="warn"><p><b>Common mistake.</b> Applying the filter as <code>output</code>. FBF works on <b>input</b>, where the router can still choose the next table. By the time a packet is in an output filter its next hop is already chosen.</p></div>
<div class="exam"><p><b>Exam trap.</b> A question lists the building blocks and asks which one is missing when the forwarding instance table is empty. The answer is the RIB group with interface routes; without it the next hop does not resolve.</p></div>
<div class="scn"><h4>The invisible staff outage</h4><p>A company steered a monitoring subnet through a second firewall with FBF. Right after commit, the helpdesk phones went dead. The filter was applied to the shared access interface and had only the monitoring term. Adding <code>term REST then accept</code> restored staff traffic within a minute.</p><p><b>Lesson:</b> every FBF filter needs a final accept term.</p></div>
<div class="iv"><p class="q">"How does filter-based forwarding differ from policy-based routing on other platforms?"</p><p>The idea is the same, steering by match conditions instead of destination. In Junos the filter does not set a next hop directly; it selects a routing instance, and that instance's table decides the next hop. This keeps the routing information in the routing tables where it can be verified.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FBF steers by source or other filter match, not just destination.</li>
<li>Ingredients: forwarding instance, RIB group, input filter, final accept term.</li>
<li>The filter is applied on <b>input</b> and selects a routing instance.</li>
<li>Without an accept term the implicit discard drops everything else.</li>
</ul></div>
`,hi:`
<p>Normal routing <b>destination based</b> hai: router destination address dekhta hai, longest prefix dhoondta hai aur forward karta hai. Iska matlab ek hi server ke liye har user ek hi path leta hai. Kabhi business kuch aur chahta hai: training lab sasta ISP use kare, finance VLAN premium link, ya monitoring subnet kisi khaas firewall se bahar jaye. Faisla <b>source</b> par hota hai, destination par nahi. Junos ise <b>filter-based forwarding</b> (FBF) se solve karta hai.</p>

<h3>Idea</h3>
<p>Firewall filter <b>input</b> interface par lagta hai. Ek term source subnet match karta hai aur uska action <code>then routing-instance NAME</code> hota hai. Match hone wale packets ka lookup <code>inet.0</code> ki jagah us instance ke table mein hota hai. Match na hone wale packets normal path lete hain.</p>

<div class="dia"><svg viewBox="0 0 660 230" role="img" aria-label="FBF flow">
<rect x="20" y="85" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="65" y="115" text-anchor="middle" class="svg-ink" font-size="12">Lab PC</text>
<rect x="150" y="70" width="130" height="80" rx="10" fill="#bae6fd"/><text x="215" y="100" text-anchor="middle" class="svg-ink" font-size="13">input filter</text><text x="215" y="122" text-anchor="middle" class="svg-muted" font-size="11">ge-0/0/3.0 par</text>
<rect x="400" y="20" width="140" height="55" rx="8" fill="#bbf7d0"/><text x="470" y="42" text-anchor="middle" class="svg-ink" font-size="12">ISP-B.inet.0</text><text x="470" y="62" text-anchor="middle" class="svg-muted" font-size="11">term LAB match</text>
<rect x="400" y="140" width="140" height="55" rx="8" fill="#fde68a"/><text x="470" y="162" text-anchor="middle" class="svg-ink" font-size="12">inet.0</text><text x="470" y="182" text-anchor="middle" class="svg-muted" font-size="11">baaki sab</text>
<line x1="110" y1="110" x2="150" y2="110" stroke="#64748b" stroke-width="2"/><line x1="280" y1="95" x2="400" y2="50" stroke="#16a34a" stroke-width="3"/><line x1="280" y1="125" x2="400" y2="165" stroke="#64748b" stroke-width="2"/>
<text x="590" y="52" class="svg-accent" font-size="12">ISP-B</text><text x="590" y="170" class="svg-muted" font-size="12">ISP-A</text>
</svg><p class="cap">Filter table chunta hai; table next hop chunta hai.</p></div>

<h3>Char building blocks</h3>
<ol>
<li><b>Forwarding instance</b> jo alternative route rakhta hai: doosre ISP ke static default ke saath <code>instance-type forwarding</code>.</li>
<li><b>RIB group</b> jo interface routes instance mein copy karta hai taaki next hop resolve ho.</li>
<li><b>Firewall filter</b> jisme source match karne wala term <code>routing-instance</code> set kare, aur baaki sab ke liye <b>aakhri accept term</b>.</li>
<li><b>Filter ka application</b> us interface par <code>input</code> ke roop mein jahan traffic aata hai.</li>
</ol>
<pre class="code">set routing-instances ISP-B instance-type forwarding
set routing-instances ISP-B routing-options static route 0.0.0.0/0 next-hop 10.0.2.2
set routing-options rib-groups FBF-RG import-rib [ inet.0 ISP-B.inet.0 ]
set routing-options interface-routes rib-group inet FBF-RG
set firewall family inet filter STEER-LAB term LAB from source-address 10.1.2.0/24
set firewall family inet filter STEER-LAB term LAB then routing-instance ISP-B
set firewall family inet filter STEER-LAB term REST then accept
set interfaces ge-0/0/3 unit 0 family inet filter input STEER-LAB</pre>

<h3>Aakhri term kyun zaroori hai</h3>
<p>Junos firewall filter ke end mein <b>implicit discard</b> hota hai. Packet kisi term se match na kare to drop ho jaata hai. <code>term REST then accept</code> ke bina lab subnet ke alawa har packet chupchap discard ho jaata, aur usi interface par staff ki connectivity chali jaati. FBF ki number-one galti yahi hai.</p>

<h3>Processing ka order</h3>
<ol>
<li>Packet input filter wale interface par aata hai.</li>
<li>Filter terms order mein chalte hain. Pehla matching term faisla karta hai.</li>
<li>Action <code>routing-instance NAME</code> ho to destination lookup <code>NAME.inet.0</code> mein hota hai.</li>
<li>Action <code>accept</code> ho to normal lookup <code>inet.0</code> mein hota hai.</li>
</ol>
<p>Filter sirf interface mein <i>aane wale</i> packets par chalta hai. Internet se laut te traffic ka apna path hota hai. Dhyan rakho ki ISP replies usi provider se wapas bheje, warna lab ka reply galat ISP se aayega aur stateful device use drop kar dega.</p>

<h3>Virtual router nahi, forwarding instance kyun?</h3>
<p>Target ko sirf packets forward karne ke liye routes chahiye. Woh OSPF ya BGP nahi chalata. <b>Forwarding</b> instance halka hai aur isi kaam ke liye bana hai. Virtual router bhi chalega, lekin exam <code>instance-type forwarding</code> expect karta hai.</p>

<table class="cmp"><tr><th>Sawal</th><th>Destination routing</th><th>Filter-based forwarding</th></tr>
<tr><td>Faisle ka factor</td><td>Destination prefix</td><td>Koi bhi filter match, jaise source address</td></tr>
<tr><td>Kahan configure</td><td>Routing table</td><td>Input firewall filter</td></tr>
<tr><td>Shaamil tables</td><td>inet.0</td><td>inet.0 aur forwarding instance</td></tr>
<tr><td>Unmatched traffic ka default</td><td>n/a</td><td>implicit discard jab tak accept na ho</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Ek school ke paas do ISPs hain. Lab subnet 10.1.2.0/24 ISP-B use kare, staff subnet 10.1.1.0/24 ISP-A. Lab-side interface par filter STEER-LAB lab packets ko ISP-B.inet.0 bhejta hai. Staff packets alag interface par aate hain jahan filter nahi hai aur woh inet.0 ke ISP-A default se jaate hain.</p></div>
<div class="warn"><p><b>Common mistake.</b> Filter ko <code>output</code> ki tarah lagana. FBF <b>input</b> par kaam karta hai, jahan router abhi table chun sakta hai. Output filter tak packet ka next hop pehle hi chuna ja chuka hota hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawal building blocks list karta hai aur poochta hai forwarding instance ka table khali ho to kaunsa missing hai. Jawab interface routes wala RIB group; uske bina next hop resolve nahi hota.</p></div>
<div class="scn"><h4>Anjaan staff outage</h4><p>Ek company ne monitoring subnet ko FBF se doosre firewall ke through bheja. Commit ke turant baad helpdesk phones dead ho gaye. Filter shared access interface par laga tha aur uske paas sirf monitoring term tha. <code>term REST then accept</code> jodne se staff traffic ek minute mein wapas aaya.</p><p><b>Lesson:</b> har FBF filter ko aakhri accept term chahiye.</p></div>
<div class="iv"><p class="q">"Filter-based forwarding doosre platforms ke policy-based routing se kaise alag hai?"</p><p>Idea wahi hai, destination ki jagah match conditions se steer karna. Junos mein filter seedha next hop set nahi karta; woh routing instance chunta hai aur us instance ka table next hop tay karta hai. Isse routing information routing tables mein rehti hai jahan use verify kiya ja sakta hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FBF sirf destination nahi, source ya doosre filter match se steer karta hai.</li>
<li>Ingredients: forwarding instance, RIB group, input filter, aakhri accept term.</li>
<li>Filter <b>input</b> par lagta hai aur routing instance chunta hai.</li>
<li>Accept term ke bina implicit discard baaki sab drop kar deta hai.</li>
</ul></div>
`}};export{e as default};