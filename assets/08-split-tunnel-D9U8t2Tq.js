var e={id:`split-tunnel`,h:{en:`Split tunnel: what goes in the tunnel and what stays out`,hi:`Split tunnel: tunnel mein kya jaata hai aur kya bahar rehta hai`},body:{en:`
<p>By default a mobile user sends traffic into the tunnel so Prisma Access can inspect it. Sometimes you want certain traffic to go straight out of the laptop's own internet connection: a large video stream, an operating system update, or a printer on the home network. This is a <b>split tunnel</b>. It is useful, but every exclusion is a place where security does not look, so a defender uses it carefully.</p>

<h3>Analogy: a motorway with a service road</h3>
<p>All cars normally use the motorway, where a toll booth checks them. A service road lets some cars skip the toll booth. It reduces queues, but you must be sure only the right cars use it.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Split tunnel">
<rect x="20" y="80" width="120" height="60" rx="8" fill="#bae6fd"/><text x="80" y="108" text-anchor="middle" class="svg-ink" font-size="12">LAPTOP-HOME</text><text x="80" y="126" text-anchor="middle" class="svg-muted" font-size="11">10.200.0.7</text>
<rect x="260" y="20" width="170" height="56" rx="8" fill="#ddd6fe"/><text x="345" y="46" text-anchor="middle" class="svg-ink" font-size="12">Prisma Access tunnel</text><text x="345" y="64" text-anchor="middle" class="svg-muted" font-size="11">inspected</text>
<rect x="260" y="140" width="170" height="56" rx="8" fill="#fed7aa"/><text x="345" y="166" text-anchor="middle" class="svg-ink" font-size="12">Direct from home ISP</text><text x="345" y="184" text-anchor="middle" class="svg-muted" font-size="11">excluded, not inspected</text>
<rect x="500" y="20" width="120" height="56" rx="8" fill="#bbf7d0"/><text x="560" y="52" text-anchor="middle" class="svg-ink" font-size="12">HQ app, web</text>
<rect x="500" y="140" width="120" height="56" rx="8" fill="#e2e8f0"/><text x="560" y="164" text-anchor="middle" class="svg-ink" font-size="12">media.example</text><text x="560" y="182" text-anchor="middle" class="svg-muted" font-size="11">video stream</text>
<line x1="140" y1="100" x2="260" y2="50" stroke="#64748b"/><line x1="140" y1="120" x2="260" y2="168" stroke="#64748b" stroke-dasharray="4"/><line x1="430" y1="48" x2="500" y2="48" stroke="#64748b"/><line x1="430" y1="168" x2="500" y2="168" stroke="#64748b" stroke-dasharray="4"/>
</svg><p class="cap">Solid lines go through Prisma Access; dashed lines bypass it.</p></div>

<h3>What the documentation describes</h3>
<p>In the SCM Tunnel Settings:</p>
<ul>
<li><b>Exclude Traffic</b> by application, domain or route.</li>
<li><b>Customize Include Traffic</b> overrides an exclusion, so you can exclude a broad domain but still include one part.</li>
<li><b>Local Network Access</b> (Windows and Mac) lets the user reach local devices such as a printer.</li>
<li>Options for excluding <b>video streaming</b> and <b>updates</b>.</li>
</ul>
<p>On Panorama there is an optional step for video and application exclusion in the agent configuration of the Mobile_User_Template.</p>
<table class="cmp"><tr><th>Tool</th><th>Path</th></tr>
<tr><td>SCM</td><td>Mobile Users &gt; GlobalProtect &gt; GlobalProtect App &gt; Tunnel Settings</td></tr>
<tr><td>Panorama</td><td>Agent configuration in Mobile_User_Template</td></tr>
</table>
<pre class="out">Tunnel Settings (lab console view)
Exclude domain        <span class="hl">*.media.example</span>
Include (override)    none
Local Network Access  Enabled (Windows, macOS)
Video exclusion       Off
</pre>

<h3>Checking the route table on the laptop</h3>
<pre class="out">C:\\&gt; route print
Destination     Netmask          Gateway       Interface
10.10.0.0       255.255.255.0    10.200.0.1    10.200.0.7
0.0.0.0         0.0.0.0          10.200.0.1    10.200.0.7
<span class="hl">203.0.113.80   255.255.255.255  203.0.113.1   203.0.113.50</span>
</pre>
<p>The highlighted host route for the excluded media server goes via the home router, not via the tunnel. That shows the exclusion is active. This sample is a simplified teaching view; real client route tables look different.</p>

<h3>Security thinking</h3>
<ul>
<li>Exclude <b>narrowly</b>: a named domain is safer than a whole country of address space.</li>
<li>Remember excluded traffic is <b>not inspected</b> by Prisma Access and will not appear in its logs.</li>
<li>Prefer excluding well-known, low-risk services such as large streaming or operating system updates.</li>
<li>Review the list regularly, and record who requested each exclusion.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Staff complain that the all-hands video call on <code>media.example</code> is choppy, because 300 people stream through the tunnel at 5 Mbps each, which is 1.5 Gbps. The administrator adds <code>*.media.example</code> to Exclude Traffic. Now video goes straight out from each home, and the tunnel carries only business traffic. A security reviewer notes the exclusion in the change record and checks that the domain list does not include broader names.</p></div>

<h3>Change control for exclusions</h3>
<p>Treat each exclusion as a small risk acceptance. The request should state the domain, the business reason, the owner and a review date. When the review date arrives, remove the exclusion if the reason has gone.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Excluding a whole address block "to be safe". (2) Forgetting that a local-network exception may expose the laptop to a hostile home network. (3) Excluding a domain that also hosts risky content. (4) Not pushing the change.</p></div>
<div class="exam"><p><b>Exam trap.</b> Include rules override exclusions, and the concept is explained in terms of applications, domains and routes. Excluded traffic bypasses inspection.</p></div>

<div class="scn"><h4>The update that crushed the tunnel</h4><p>Each month on update day, the gateway bandwidth for the Asia location spiked because every laptop downloaded a large operating system update through the tunnel. The administrator excluded the update domain, and the next update cycle caused no spike. The security team accepted the change because updates are signed and the domain is vendor-owned.</p><p><b>Lesson:</b> exclude with a reason you can defend.</p></div>

<div class="iv"><p class="q">"What is split tunneling and what are the risks?"</p><p>Strong answer: only some traffic goes through Prisma Access; excluded traffic goes directly out of the device's own connection. Benefits are bandwidth and performance. Risks are no inspection or logging for excluded traffic, so exclude narrowly, review regularly and keep include overrides in mind.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Exclude Traffic works by application, domain or route; Include overrides exclusions.</li>
<li>Local Network Access applies to Windows and Mac.</li>
<li>Excluded traffic is not inspected; exclude narrowly and review.</li>
<li>Path: Tunnel Settings in SCM, agent configuration on Panorama.</li>
<li>Verify with the laptop route table.</li>
</ul></div>
`,hi:`
<p>Default mein mobile user traffic tunnel mein bhejta hai taaki Prisma Access use inspect kar sake. Kabhi aap chahte ho ki kuch traffic laptop ke apne internet connection se seedha nikle: bada video stream, operating system update, ya home network ka printer. Isse <b>split tunnel</b> kehte hain. Yeh useful hai, lekin har exclusion woh jagah hai jahan security nahi dekhti, isliye defender ise dhyan se use karta hai.</p>

<h3>Analogy: motorway aur service road</h3>
<p>Saari gaadiyan normally motorway use karti hain, jahan toll booth unhe check karta hai. Service road kuch gaadiyon ko toll booth skip karne deti hai. Isse queues kam hoti hain, lekin pakka karna padta hai ki sirf sahi gaadiyan hi use karein.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Split tunnel">
<rect x="20" y="80" width="120" height="60" rx="8" fill="#bae6fd"/><text x="80" y="108" text-anchor="middle" class="svg-ink" font-size="12">LAPTOP-HOME</text><text x="80" y="126" text-anchor="middle" class="svg-muted" font-size="11">10.200.0.7</text>
<rect x="260" y="20" width="170" height="56" rx="8" fill="#ddd6fe"/><text x="345" y="46" text-anchor="middle" class="svg-ink" font-size="12">Prisma Access tunnel</text><text x="345" y="64" text-anchor="middle" class="svg-muted" font-size="11">inspected</text>
<rect x="260" y="140" width="170" height="56" rx="8" fill="#fed7aa"/><text x="345" y="166" text-anchor="middle" class="svg-ink" font-size="12">Ghar ke ISP se seedha</text><text x="345" y="184" text-anchor="middle" class="svg-muted" font-size="11">excluded, inspect nahi</text>
<rect x="500" y="20" width="120" height="56" rx="8" fill="#bbf7d0"/><text x="560" y="52" text-anchor="middle" class="svg-ink" font-size="12">HQ app, web</text>
<rect x="500" y="140" width="120" height="56" rx="8" fill="#e2e8f0"/><text x="560" y="164" text-anchor="middle" class="svg-ink" font-size="12">media.example</text><text x="560" y="182" text-anchor="middle" class="svg-muted" font-size="11">video stream</text>
<line x1="140" y1="100" x2="260" y2="50" stroke="#64748b"/><line x1="140" y1="120" x2="260" y2="168" stroke="#64748b" stroke-dasharray="4"/><line x1="430" y1="48" x2="500" y2="48" stroke="#64748b"/><line x1="430" y1="168" x2="500" y2="168" stroke="#64748b" stroke-dasharray="4"/>
</svg><p class="cap">Solid lines Prisma Access se jaati hain; dashed lines use bypass karti hain.</p></div>

<h3>Documentation kya describe karti hai</h3>
<p>SCM Tunnel Settings mein:</p>
<ul>
<li><b>Exclude Traffic</b> application, domain ya route ke hisaab se.</li>
<li><b>Customize Include Traffic</b> exclusion ko override karta hai, to aap broad domain exclude karke bhi uska ek hissa include rakh sakte ho.</li>
<li><b>Local Network Access</b> (Windows aur Mac) user ko local devices, jaise printer, tak pahunchne deta hai.</li>
<li><b>Video streaming</b> aur <b>updates</b> exclude karne ke options.</li>
</ul>
<p>Panorama par Mobile_User_Template ke agent configuration mein video aur application exclusion ke liye optional step hai.</p>
<table class="cmp"><tr><th>Tool</th><th>Path</th></tr>
<tr><td>SCM</td><td>Mobile Users &gt; GlobalProtect &gt; GlobalProtect App &gt; Tunnel Settings</td></tr>
<tr><td>Panorama</td><td>Mobile_User_Template mein agent configuration</td></tr>
</table>
<pre class="out">Tunnel Settings (lab console view)
Exclude domain        <span class="hl">*.media.example</span>
Include (override)    none
Local Network Access  Enabled (Windows, macOS)
Video exclusion       Off
</pre>

<h3>Laptop par route table check karna</h3>
<pre class="out">C:\\&gt; route print
Destination     Netmask          Gateway       Interface
10.10.0.0       255.255.255.0    10.200.0.1    10.200.0.7
0.0.0.0         0.0.0.0          10.200.0.1    10.200.0.7
<span class="hl">203.0.113.80   255.255.255.255  203.0.113.1   203.0.113.50</span>
</pre>
<p>Excluded media server ka highlighted host route home router se jaata hai, tunnel se nahi. Yeh dikhata hai ki exclusion active hai. Yeh sample simplified teaching view hai; asli client route tables alag dikhte hain.</p>

<h3>Security soch</h3>
<ul>
<li><b>Narrowly</b> exclude karo: named domain poore address space se safer hai.</li>
<li>Yaad rakho excluded traffic Prisma Access dwara <b>inspect nahi</b> hota aur uske logs mein nahi dikhta.</li>
<li>Well-known, low-risk services, jaise bade streaming ya operating system updates, exclude karna prefer karo.</li>
<li>List ko regularly review karo, aur record karo har exclusion kisne maanga.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Staff shikayat karte hain ki <code>media.example</code> par all-hands video call choppy hai, kyunki 300 log tunnel se 5 Mbps each stream karte hain, yaani 1.5 Gbps. Administrator Exclude Traffic mein <code>*.media.example</code> add karta hai. Ab video har ghar se seedha nikalta hai, aur tunnel sirf business traffic carry karta hai. Security reviewer change record mein exclusion note karta hai aur check karta hai ki domain list mein broader names nahi hain.</p></div>

<h3>Exclusions ke liye change control</h3>
<p>Har exclusion ko chhoti risk acceptance maano. Request mein domain, business reason, owner aur review date likhi honi chahiye. Review date aane par reason khatam ho gaya ho to exclusion hata do.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) "Safe rehne ke liye" poora address block exclude karna. (2) Bhool jaana ki local-network exception laptop ko hostile home network ke saamne expose kar sakta hai. (3) Aisa domain exclude karna jo risky content bhi host karta hai. (4) Change push na karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Include rules exclusions ko override karte hain, aur concept applications, domains aur routes ke terms mein explain hota hai. Excluded traffic inspection bypass karta hai.</p></div>

<div class="scn"><h4>Update jo tunnel ko dabaa gaya</h4><p>Har mahine update day par Asia location ka gateway bandwidth spike karta tha kyunki har laptop tunnel se bada operating system update download karta tha. Administrator ne update domain exclude kiya, aur agle update cycle mein spike nahi aaya. Security team ne change accept kiya kyunki updates signed hain aur domain vendor-owned hai.</p><p><b>Seekh:</b> aise reason ke saath exclude karo jise aap defend kar sako.</p></div>

<div class="iv"><p class="q">"Split tunneling kya hai aur risks kya hain?"</p><p>Strong answer: sirf kuch traffic Prisma Access se jaata hai; excluded traffic device ke apne connection se seedha nikalta hai. Fayde bandwidth aur performance hain. Risks: excluded traffic ke liye inspection ya logging nahi, isliye narrowly exclude karo, regularly review karo aur include overrides yaad rakho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Exclude Traffic application, domain ya route se kaam karta hai; Include exclusions ko override karta hai.</li>
<li>Local Network Access Windows aur Mac par lagta hai.</li>
<li>Excluded traffic inspect nahi hota; narrowly exclude karo aur review karo.</li>
<li>Path: SCM mein Tunnel Settings, Panorama par agent configuration.</li>
<li>Laptop route table se verify karo.</li>
</ul></div>
`}};export{e as default};