var e={id:`https-inspection`,h:{en:`HTTPS inspection and client protection`,hi:`HTTPS inspection aur client protection`},body:{en:`
<p>Most web traffic today is encrypted. The engine can see the IP addresses and ports of an HTTPS connection, but not the request path inside it. So the training pattern /vuln-test sent over HTTPS passes untouched, unless HTTPS inspection is configured. This chapter explains how decryption works, what it needs, and why some sites must be excluded.</p>

<h3>Start with an analogy: the sealed envelope</h3>
<p>HTTPS is a sealed envelope. The postman (the firewall) can read the address on the outside but not the letter. To check the letter, the post office would open every envelope, read it, and then put it in a new envelope with its own seal. The receiver must accept that new seal, otherwise the letter is refused. HTTPS inspection does exactly that: the engine ends the client's TLS session, inspects the clear content, and starts a new TLS session to the real server.</p>

<h3>Three conditions must all be true</h3>
<p>In the simulator model, the engine decrypts a connection only when:</p>
<ol>
<li>the Inspection policy has <b>HTTPS inspection enabled</b>,</li>
<li>the matching Access rule has the <b>https flag</b> (client protection for traffic from your users to Internet sites), and</li>
<li>the site is <b>not in the exclusions</b> list.</li>
</ol>
<p>If any of the three is missing, the traffic stays encrypted and the log says the engine cannot see the path. Deep inspection of the content (chapter 2) then has nothing to read, even when the deep flag is on. Deep and https are two different flags on a rule; HTTPS decryption feeds the deep inspection stage.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="HTTPS inspection flow">
<rect x="10" y="60" width="120" height="60" rx="8" fill="#bae6fd"/><text x="70" y="86" text-anchor="middle" class="svg-ink" font-size="13">STAFF-PC</text><text x="70" y="106" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.10</text>
<rect x="260" y="40" width="130" height="100" rx="8" fill="#ddd6fe"/><text x="325" y="68" text-anchor="middle" class="svg-ink" font-size="13">NK-PUNE-FW</text><text x="325" y="90" text-anchor="middle" class="svg-muted" font-size="12">decrypt, inspect,</text><text x="325" y="108" text-anchor="middle" class="svg-muted" font-size="12">re-encrypt</text>
<rect x="520" y="60" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="575" y="86" text-anchor="middle" class="svg-ink" font-size="13">Web site</text><text x="575" y="106" text-anchor="middle" class="svg-muted" font-size="12">on Internet</text>
<line x1="130" y1="90" x2="260" y2="90" stroke="#64748b" stroke-width="2"/><line x1="390" y1="90" x2="520" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="195" y="80" text-anchor="middle" class="svg-muted" font-size="12">TLS 1</text><text x="455" y="80" text-anchor="middle" class="svg-muted" font-size="12">TLS 2</text>
<rect x="10" y="165" width="620" height="40" rx="8" fill="#fde68a"/><text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="13">Two TLS sessions. The PC must trust the certificate the engine signs with.</text>
</svg><p class="cap">The engine sits in the middle of two separate encrypted sessions.</p></div>

<h3>Certificate trust</h3>
<p>For the first TLS session, the engine presents a certificate for the site, signed by its own certificate authority (CA). The client accepts it only if the browser or operating system trusts that CA. In an organisation you normally distribute the CA certificate to managed devices. Guests and unmanaged devices will see warnings. Keep the private key of that CA protected; whoever holds it can impersonate any site to your users. How you create and distribute the CA depends on your NGFW version, so check the documentation. This simulator does not model certificate files.</p>

<h3>Pinned sites and exclusions</h3>
<p>Some applications and websites use <b>certificate pinning</b>: they remember the exact certificate they expect and refuse any other, including a trusted re-signed one. Online banking apps are the classic case. When the engine decrypts them the client shows a TLS error and the site breaks. The fix is an <b>exclusion</b>: a list in the HTTPS inspection settings of sites (or URL categories, such as Banking) that are left encrypted. Privacy is the second reason to exclude: many organisations choose not to decrypt employees' banking or health traffic.</p>
<p>The trade-off is real. An excluded site is not inspected, so exclude narrowly (the specific domain, or a small category) and accept that content in them is invisible to deep inspection.</p>

<div class="eg"><p><b>Worked example (lab fp-inspection-3).</b> At Pune, STAFF-PC (10.1.1.10) browses to two sites through NK-PUNE-FW. Step one: enable HTTPS inspection in the Inspection policy and set the https flag on the Staff-to-Internet rule. Install. A normal HTTPS site now shows "HTTPS decrypted and inspected" in the log. Step two: netbank.example fails with a TLS error because it pins its certificate. Step three: add netbank.example (or the category Banking) to the exclusions, install again. netbank.example now loads, and the log says it was skipped because it is excluded. Other sites are still decrypted.</p></div>

<pre class="out">HTTPS not decrypted: the engine cannot see the path          (flag or policy setting missing)
HTTPS decrypted and inspected                                (all three conditions true)
<span class="hl">HTTPS inspected: client rejected certificate</span>   netbank.example   (pinned site, not yet excluded)
HTTPS inspection skipped for netbank.example (excluded)      (fixed)</pre>

<div class="warn"><p><b>Common mistakes.</b></p><ul>
<li>Enabling HTTPS inspection in the policy but forgetting the https flag on the rule (or the reverse).</li>
<li>Decrypting everything, including banking and health sites, then drowning in user complaints and privacy concerns.</li>
<li>Rolling out to all users on day one without a pilot group that already trusts the CA.</li>
<li>Believing the exclusion list lowers security of the whole firewall: it only affects the named sites.</li>
</ul></div>

<div class="exam"><p><b>Exam trap.</b> Deep inspection flag on but HTTPS inspection off: an HTTPS request to /vuln-test is NOT terminated, because the engine cannot see the path. That is a visibility gap, not a bug. Another trap: the https flag alone, without the policy setting enabled, also does nothing.</p></div>

<div class="scn"><h4>Banking portal, Monday morning</h4><p>The Pune finance desk reported that the bank portal showed a certificate error after the weekend change that turned on HTTPS inspection. Other sites worked fine. The engineer reproduced the failure from STAFF-PC, read the log and found a client certificate rejection for the bank domain. The bank pins its certificate. They added the bank domain to the exclusions, installed the policy and retested: the portal opened, and the log showed the skip. They also confirmed another HTTPS site was still decrypted.</p><p><b>Lesson:</b> decrypt by default, exclude by evidence and policy, and always retest a decrypted site after adding an exclusion.</p></div>

<div class="iv"><p class="q">"Why does HTTPS inspection break some applications and how do you handle that?"</p><p>Strong answer: the engine terminates TLS and re-signs with its own CA, so clients must trust that CA and applications that pin certificates reject it. Handle it with exclusions by domain or category, a pilot group, and a documented list of what is not inspected. Mention privacy and legal review for banking and health traffic.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HTTPS hides the path; HTTPS inspection needs the policy setting and the rule https flag.</li>
<li>The engine creates two TLS sessions; clients must trust the signing CA.</li>
<li>Pinned sites such as banking fail when decrypted, so they go in the exclusions.</li>
<li>Exclusions are narrow, documented and reviewed, since excluded traffic is not inspected.</li>
<li>Install policy and retest a decrypted site and an excluded site.</li>
</ul></div>
`,hi:`
<p>Aaj ka zyada tar web traffic encrypted hota hai. Engine HTTPS connection ke IP addresses aur ports dekh sakta hai, lekin andar ka request path nahi. Isliye HTTPS par bheja gaya training pattern /vuln-test bina chhue nikal jaata hai, jab tak HTTPS inspection configure na ho. Yeh chapter samjhata hai ki decryption kaise kaam karta hai, ise kya chahiye, aur kuch sites ko exclude kyun karna padta hai.</p>

<h3>Ek analogy se shuru karo: sealed envelope</h3>
<p>HTTPS ek sealed envelope hai. Postman (firewall) bahar likha address padh sakta hai, letter nahi. Letter check karne ke liye post office har envelope kholega, padhega, aur phir apni seal ke saath naye envelope mein daalega. Receiver ko woh nayi seal accept karni hogi, warna letter refuse ho jaata hai. HTTPS inspection bilkul yahi karta hai: engine client ka TLS session khatam karta hai, clear content inspect karta hai, aur asli server ke liye naya TLS session start karta hai.</p>

<h3>Teen conditions ek saath true honi chahiye</h3>
<p>Simulator model mein engine connection tabhi decrypt karta hai jab:</p>
<ol>
<li>Inspection policy mein <b>HTTPS inspection enabled</b> ho,</li>
<li>matching Access rule par <b>https flag</b> ho (aapke users se Internet sites tak ke traffic ke liye client protection), aur</li>
<li>site <b>exclusions list mein na ho</b>.</li>
</ol>
<p>Teeno mein se koi ek bhi missing ho to traffic encrypted rehta hai aur log kehta hai ki engine path nahi dekh sakta. Tab deep flag on ho tab bhi deep inspection (chapter 2) ke paas padhne ko kuch nahi hota. Deep aur https rule ke do alag flags hain; HTTPS decryption deep inspection stage ko feed karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="HTTPS inspection flow">
<rect x="10" y="60" width="120" height="60" rx="8" fill="#bae6fd"/><text x="70" y="86" text-anchor="middle" class="svg-ink" font-size="13">STAFF-PC</text><text x="70" y="106" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.10</text>
<rect x="260" y="40" width="130" height="100" rx="8" fill="#ddd6fe"/><text x="325" y="68" text-anchor="middle" class="svg-ink" font-size="13">NK-PUNE-FW</text><text x="325" y="90" text-anchor="middle" class="svg-muted" font-size="12">decrypt, inspect,</text><text x="325" y="108" text-anchor="middle" class="svg-muted" font-size="12">re-encrypt</text>
<rect x="520" y="60" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="575" y="86" text-anchor="middle" class="svg-ink" font-size="13">Web site</text><text x="575" y="106" text-anchor="middle" class="svg-muted" font-size="12">Internet par</text>
<line x1="130" y1="90" x2="260" y2="90" stroke="#64748b" stroke-width="2"/><line x1="390" y1="90" x2="520" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="195" y="80" text-anchor="middle" class="svg-muted" font-size="12">TLS 1</text><text x="455" y="80" text-anchor="middle" class="svg-muted" font-size="12">TLS 2</text>
<rect x="10" y="165" width="620" height="40" rx="8" fill="#fde68a"/><text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="13">Do TLS sessions. PC ko engine ke signing certificate par trust karna hoga.</text>
</svg><p class="cap">Engine do alag encrypted sessions ke beech mein baitha hai.</p></div>

<h3>Certificate trust</h3>
<p>Pehle TLS session ke liye engine site ka certificate dikhata hai, jo uski apni certificate authority (CA) ne sign kiya hota hai. Client use tabhi accept karta hai jab browser ya operating system us CA par trust kare. Organisation mein aap normally CA certificate managed devices par distribute karte ho. Guests aur unmanaged devices warnings dekhenge. Us CA ki private key ko protect karke rakho; jiske paas woh hai woh aapke users ko kisi bhi site ka impersonation dikha sakta hai. CA kaise banti aur distribute hoti hai yeh aapke NGFW version par depend karta hai, isliye documentation check karo. Yeh simulator certificate files model nahi karta.</p>

<h3>Pinned sites aur exclusions</h3>
<p>Kuch applications aur websites <b>certificate pinning</b> use karti hain: woh exact certificate yaad rakhti hain jo unhe chahiye aur koi aur refuse kar deti hain, trusted re-signed bhi. Online banking apps classic case hain. Engine inhe decrypt kare to client TLS error dikhata hai aur site toot jaati hai. Fix hai <b>exclusion</b>: HTTPS inspection settings mein sites (ya URL categories, jaise Banking) ki list jo encrypted hi chhodi jaati hain. Privacy doosra reason hai: kayi organisations employees ke banking ya health traffic ko decrypt nahi karna chunti hain.</p>
<p>Trade-off real hai. Excluded site inspect nahi hoti, isliye narrow exclude karo (specific domain, ya chhoti category) aur maano ki unka content deep inspection ko invisible hai.</p>

<div class="eg"><p><b>Worked example (lab fp-inspection-3).</b> Pune mein STAFF-PC (10.1.1.10) NK-PUNE-FW ke through do sites browse karta hai. Step ek: Inspection policy mein HTTPS inspection enable karo aur Staff-to-Internet rule par https flag set karo. Install karo. Ek normal HTTPS site ab log mein "HTTPS decrypted and inspected" dikhati hai. Step do: netbank.example TLS error ke saath fail hoti hai kyunki woh apna certificate pin karti hai. Step teen: netbank.example (ya category Banking) ko exclusions mein add karo, dobara install karo. netbank.example ab load hoti hai, aur log kehta hai ki excluded hone ki wajah se skip hui. Baaki sites ab bhi decrypt hoti hain.</p></div>

<pre class="out">HTTPS not decrypted: the engine cannot see the path          (flag ya policy setting missing)
HTTPS decrypted and inspected                                (teeno conditions true)
<span class="hl">HTTPS inspected: client rejected certificate</span>   netbank.example   (pinned site, abhi excluded nahi)
HTTPS inspection skipped for netbank.example (excluded)      (fixed)</pre>

<div class="warn"><p><b>Common mistakes.</b></p><ul>
<li>Policy mein HTTPS inspection enable karna lekin rule par https flag bhoolna (ya ulta).</li>
<li>Sab kuch decrypt karna, banking aur health sites samet, phir user complaints aur privacy concerns mein doob jaana.</li>
<li>Pilot group ke bina pehle din hi sab users par roll out karna, jinhone CA par trust nahi kiya hota.</li>
<li>Yeh maanna ki exclusion list poore firewall ki security kam karti hai: woh sirf named sites ko affect karti hai.</li>
</ul></div>

<div class="exam"><p><b>Exam trap.</b> Deep inspection flag on lekin HTTPS inspection off: /vuln-test ki HTTPS request terminate NAHI hoti, kyunki engine path nahi dekh sakta. Yeh visibility gap hai, bug nahi. Ek aur trap: akela https flag, policy setting enabled ke bina, bhi kuch nahi karta.</p></div>

<div class="scn"><h4>Banking portal, Monday subah</h4><p>Pune finance desk ne report kiya ki weekend change ke baad, jisme HTTPS inspection on hua tha, bank portal certificate error dikha raha tha. Baaki sites theek thi. Engineer ne STAFF-PC se failure reproduce kiya, log padha aur bank domain ke liye client certificate rejection mila. Bank apna certificate pin karti hai. Unhone bank domain exclusions mein add kiya, policy install ki aur retest kiya: portal khuli, aur log mein skip dikha. Unhone yeh bhi confirm kiya ki ek aur HTTPS site ab bhi decrypt ho rahi thi.</p><p><b>Lesson:</b> default mein decrypt karo, evidence aur policy ke hisaab se exclude karo, aur exclusion add karne ke baad ek decrypted site hamesha retest karo.</p></div>

<div class="iv"><p class="q">"HTTPS inspection kuch applications kyun tod deta hai aur aap ise kaise handle karte ho?"</p><p>Strong answer: engine TLS terminate karke apni CA se re-sign karta hai, isliye clients ko us CA par trust karna hota hai aur certificate pin karne wali applications ise reject karti hain. Exclusions (domain ya category se), pilot group aur "kya inspect nahi hota" ki documented list se handle karo. Banking aur health traffic ke liye privacy aur legal review mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HTTPS path chhupata hai; HTTPS inspection ko policy setting aur rule https flag chahiye.</li>
<li>Engine do TLS sessions banata hai; clients ko signing CA par trust karna hoga.</li>
<li>Pinned sites jaise banking decrypt karne par fail hoti hain, isliye exclusions mein jaati hain.</li>
<li>Exclusions narrow, documented aur reviewed hon, kyunki excluded traffic inspect nahi hota.</li>
<li>Install policy karo aur ek decrypted site aur ek excluded site retest karo.</li>
</ul></div>
`}};export{e as default};