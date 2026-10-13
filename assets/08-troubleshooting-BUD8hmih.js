var e={id:`troubleshooting`,h:{en:`Troubleshooting and migrating segment routing`,hi:`Segment routing troubleshooting aur migration`},body:{en:`
<p>Segment routing problems nearly always fall into one of three places: the <b>IGP</b> (the SID was never advertised), the <b>label table</b> (the SID was received but not installed), or the <b>policy</b> (the path is invalid or traffic is not steered). Work from the IGP upward, like checking that a street name is on the map before blaming the driver.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="Five checks from the IGP to protection. Stop at the first failure."><rect x="20" y="30" width="102" height="70" rx="10" fill="#bae6fd"/><text x="71" y="58" text-anchor="middle" class="svg-ink" font-size="13">1. IGP</text><text x="71" y="80" text-anchor="middle" class="svg-muted" font-size="12">adjacency, wide metrics</text><line x1="122" y1="65" x2="144" y2="65" stroke="#64748b" stroke-width="2"/><rect x="144" y="30" width="102" height="70" rx="10" fill="#bbf7d0"/><text x="195" y="58" text-anchor="middle" class="svg-ink" font-size="13">2. SIDs</text><text x="195" y="80" text-anchor="middle" class="svg-muted" font-size="12">advertised, unique</text><line x1="246" y1="65" x2="268" y2="65" stroke="#64748b" stroke-width="2"/><rect x="268" y="30" width="102" height="70" rx="10" fill="#ddd6fe"/><text x="319" y="58" text-anchor="middle" class="svg-ink" font-size="13">3. Labels</text><text x="319" y="80" text-anchor="middle" class="svg-muted" font-size="12">table, FIB</text><line x1="370" y1="65" x2="392" y2="65" stroke="#64748b" stroke-width="2"/><rect x="392" y="30" width="102" height="70" rx="10" fill="#fde68a"/><text x="443" y="58" text-anchor="middle" class="svg-ink" font-size="13">4. Policy</text><text x="443" y="80" text-anchor="middle" class="svg-muted" font-size="12">valid, steered</text><line x1="494" y1="65" x2="516" y2="65" stroke="#64748b" stroke-width="2"/><rect x="516" y="30" width="102" height="70" rx="10" fill="#fed7aa"/><text x="567" y="58" text-anchor="middle" class="svg-ink" font-size="13">5. Protection</text><text x="567" y="80" text-anchor="middle" class="svg-muted" font-size="12">TI-LFA state</text></svg><p class="cap">Five checks from the IGP to protection. Stop at the first failure.</p></div>
<div class="note"><p>This module has no lab, so below you find <b>what to run and what to look for</b> and no sample output. Practise the IS-IS and label-forwarding parts in <code>spcor-isis</code> and <code>spcor-mpls-ldp</code>.</p></div>
<h3>Step 1: is the IGP healthy?</h3>
<ul>
<li>Adjacencies up on all core links (<code>show isis neighbors</code>) and the topology complete (<code>show isis database</code>).</li>
<li><code>metric-style wide</code> on every router. With narrow metrics the SR sub-TLVs are not carried.</li>
<li>For flex-algo or SR-TE with TE metric, check that the right link attributes are advertised.</li>
</ul>
<h3>Step 2: are the SIDs advertised and unique?</h3>
<ol>
<li>Check the IS-IS database in verbose form (<code>show isis database verbose</code> on XR, <code>show isis database detail</code> on XE) for the prefix-SID of the loopback and for the router capability with the SRGB.</li>
<li>Look for SID conflicts: two prefixes with the same index, or an index outside the SRGB. The IGP logs and the label table show which SID lost.</li>
<li>Compare the SRGB across the routers. Different SRGBs still work but are a source of confusion; with a platform whose SRGB is too small, high indexes fail.</li>
<li>Verify that the loopback prefix is advertised in the IGP (passive interface, correct process) and that SR is enabled in the correct address family.</li>
</ol>
<h3>Step 3: are labels installed and does forwarding work?</h3>
<ul>
<li>The label table: <code>show isis segment-routing label table</code> (XR). Each prefix-SID should map to a label that equals SRGB base plus index.</li>
<li>The MPLS forwarding table: <code>show mpls forwarding</code> (XR) or <code>show mpls forwarding-table</code> (XE) should show the label, the next hop and the outgoing interface. A missing entry means SR is not installed for it, for example because LDP is preferred or the next hop does not support SR.</li>
<li>Use <code>ping sr-mpls</code> and <code>traceroute sr-mpls</code> to the prefix-SID FEC (XR) to test the label path hop by hop.</li>
<li>With coexistence, check which label is chosen (SR or LDP) and the preference setting (<code>sr-prefer</code> or <code>sr-label-preferred</code>).</li>
</ul>
<h3>Step 4: policies and steering</h3>
<ul>
<li><code>show segment-routing traffic-eng policy</code> (XR) lists each policy, its state (up or down), active candidate path, preference and segment list. A policy that is down shows the reason: no valid path, a SID that does not resolve, or a segment list too deep for the MSD.</li>
<li>Explicit lists: check each SID exists and resolves in the current topology. Dynamic paths: check the metric type and the constraints (affinity names are defined, link affinities set) and that the endpoint is in the database.</li>
<li>Steering: does the BGP route carry the right color extended community, and is the next hop equal to the endpoint of a policy with that color? Does the ODN template exist for the color?</li>
<li>If traffic ignores the policy, check <code>show route</code> and CEF for the destination: the next hop should show the policy.</li>
</ul>
<h3>Step 5: protection</h3>
<ul>
<li><code>show isis fast-reroute detail</code> should list a repair path for each protected prefix with its type. Prefixes shown as unprotected may be too far in a topology without enough SID depth or have no loop-free repair under the chosen tiebreakers.</li>
<li>TI-LFA must be enabled on both sides of the link and on every core interface.</li>
<li>Microloops: check that microloop avoidance is enabled and that its timers fit your convergence times.</li>
<li>Remember that detection speed (loss of signal, BFD) decides the total repair time.</li>
</ul>
<table class="cmp"><tr><th>Symptom</th><th>First check</th><th>Likely cause</th></tr><tr><td>SID not in label table</td><td>IS-IS database verbose</td><td>Not advertised, wide metrics missing, SID conflict</td></tr><tr><td>Label in table, ping sr-mpls fails</td><td>Forwarding table hop by hop</td><td>Next hop without SR, SRGB mismatch, MTU</td></tr><tr><td>Traffic uses LDP, not SR</td><td>Preference setting</td><td>sr-prefer missing, next hop not SR-capable</td></tr><tr><td>Policy down</td><td>Policy detail: reason</td><td>Invalid SID in list, no path under constraints, MSD exceeded</td></tr><tr><td>Route not steered</td><td>BGP route color and next hop</td><td>Wrong color, endpoint mismatch, no ODN template</td></tr><tr><td>No fast reroute</td><td>fast-reroute detail</td><td>Not enabled on both sides, MSD, tiebreaker too strict</td></tr></table>
<h3>Migration plan from LDP and RSVP-TE</h3>
<ol>
<li><b>Plan.</b> Choose the SRGB, a numbering plan for indexes, and the IGP (IS-IS or OSPF) with wide metrics. Check platform support and MSD.</li>
<li><b>Enable SR in the IGP</b> on all core routers, assign prefix-SIDs to loopbacks, leave LDP running and verify labels and <code>ping sr-mpls</code>.</li>
<li><b>Set preference</b> (sr-prefer) so SR labels are used while LDP stays as a safety net. Use mapping servers for non-SR devices.</li>
<li><b>Enable TI-LFA and microloop avoidance</b>, test failures in a maintenance window, then retire manual MPLS-TE FRR backups.</li>
<li><b>Replace RSVP-TE tunnels</b> with SR policies or ODN with colors, one service at a time.</li>
<li><b>Remove LDP</b> from the core after a stable period, keeping it only where required.</li>
</ol>
<div class="eg"><p><b>Worked example.</b> After enabling SR on a P router, prefix-SID 16007 of PE7 is missing from the label table on PE1. The IS-IS database shows PE7 with index 7, but also P2 with index 7. P2 won, so PE7 lost its SID. You give PE7 index 107, the label becomes 16107, the table shows it with the expected next hop, and <code>ping sr-mpls</code> to PE7 succeeds.</p></div>
<div class="warn"><p><b>Common mistake.</b> Changing SRGB or indexes in a live network without a plan. Changing the SRGB on a router changes every label it uses, and a bad change can blackhole traffic. Do SID and SRGB changes in a maintenance window, one router at a time, keeping LDP as fallback.</p></div>
<div class="exam"><p><b>Exam trap.</b> The questions often give a symptom such as "SR label missing" and ask for the first check. Start with the IGP database for the SID and conflicts. For policy problems, look at the policy state and the color match. For migration, remember that SR and LDP coexist and a mapping server helps the non-SR parts.</p></div>
<div class="scn"><h4>Colour typo</h4><p>A new video VPN was not using its low-latency policy. The policy was up and healthy, but the video routes had color 110 instead of 100 because of a typo in the route policy. With no matching policy or ODN template, the routes silently followed the IGP path. Fixing the route policy moved the VPN to the policy within a minute.</p><p><b>Lesson:</b> when SR-TE seems to do nothing, check the color on the BGP route before blaming the policy.</p></div>
<div class="iv"><p class="q">"An SR prefix-SID is missing from a router label table. What do you check?"</p><p>First the IGP: adjacency, wide metrics and that the originating router actually advertises the prefix-SID, using the IS-IS database in verbose form. Then SID conflicts (same index on two prefixes) and the SRGB, because an index outside the block or a conflict removes the SID. Then the forwarding table and next hop SR capability, and finally the SR versus LDP preference. I test with ping sr-mpls.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Troubleshoot in order: IGP, SIDs, labels and forwarding, policy and steering, protection.</li>
<li>SID conflicts and missing wide metrics are the most common causes of missing SIDs.</li>
<li>A policy that is up but unused usually has a color or next hop mismatch.</li>
<li>Migrate in steps: SR with LDP, prefer SR, TI-LFA, SR policies, then remove LDP.</li>
<li>Plan SRGB and index changes carefully; use ping sr-mpls and traceroute sr-mpls.</li>
</ul></div>
`,hi:`
<p>Segment routing ki problems lagbhag hamesha teen jagah hoti hain: <b>IGP</b> (SID kabhi advertise nahi hua), <b>label table</b> (SID mila lekin install nahi hua), ya <b>policy</b> (path invalid hai ya traffic steer nahi ho raha). IGP se upar ki taraf kaam karo, jaise driver ko blame karne se pehle check karna ki street name map par hai ya nahi.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="IGP se protection tak paanch checks. Pehle failure par ruk jao."><rect x="20" y="30" width="102" height="70" rx="10" fill="#bae6fd"/><text x="71" y="58" text-anchor="middle" class="svg-ink" font-size="13">1. IGP</text><text x="71" y="80" text-anchor="middle" class="svg-muted" font-size="12">adjacency, wide metrics</text><line x1="122" y1="65" x2="144" y2="65" stroke="#64748b" stroke-width="2"/><rect x="144" y="30" width="102" height="70" rx="10" fill="#bbf7d0"/><text x="195" y="58" text-anchor="middle" class="svg-ink" font-size="13">2. SIDs</text><text x="195" y="80" text-anchor="middle" class="svg-muted" font-size="12">advertised, unique</text><line x1="246" y1="65" x2="268" y2="65" stroke="#64748b" stroke-width="2"/><rect x="268" y="30" width="102" height="70" rx="10" fill="#ddd6fe"/><text x="319" y="58" text-anchor="middle" class="svg-ink" font-size="13">3. Labels</text><text x="319" y="80" text-anchor="middle" class="svg-muted" font-size="12">table, FIB</text><line x1="370" y1="65" x2="392" y2="65" stroke="#64748b" stroke-width="2"/><rect x="392" y="30" width="102" height="70" rx="10" fill="#fde68a"/><text x="443" y="58" text-anchor="middle" class="svg-ink" font-size="13">4. Policy</text><text x="443" y="80" text-anchor="middle" class="svg-muted" font-size="12">valid, steered</text><line x1="494" y1="65" x2="516" y2="65" stroke="#64748b" stroke-width="2"/><rect x="516" y="30" width="102" height="70" rx="10" fill="#fed7aa"/><text x="567" y="58" text-anchor="middle" class="svg-ink" font-size="13">5. Protection</text><text x="567" y="80" text-anchor="middle" class="svg-muted" font-size="12">TI-LFA state</text></svg><p class="cap">IGP se protection tak paanch checks. Pehle failure par ruk jao.</p></div>
<div class="note"><p>Is module ka lab nahi hai, isliye neeche <b>kya chalana hai aur kya dekhna hai</b> diya hai, sample output ke bina. IS-IS aur label-forwarding hisse <code>spcor-isis</code> aur <code>spcor-mpls-ldp</code> mein practise karo.</p></div>
<h3>Step 1: kya IGP healthy hai?</h3>
<ul>
<li>Saare core links par adjacencies up (<code>show isis neighbors</code>) aur topology poori (<code>show isis database</code>).</li>
<li>Har router par <code>metric-style wide</code>. Narrow metrics ke saath SR sub-TLVs carry nahi hote.</li>
<li>Flex-algo ya TE metric wale SR-TE ke liye check karo ki sahi link attributes advertise ho rahe hain.</li>
</ul>
<h3>Step 2: kya SIDs advertised aur unique hain?</h3>
<ol>
<li>IS-IS database verbose form mein dekho (XR par <code>show isis database verbose</code>, XE par <code>show isis database detail</code>) loopback ke prefix-SID ke liye aur SRGB wale router capability ke liye.</li>
<li>SID conflicts dhoondo: do prefixes ka same index, ya SRGB ke bahar ka index. IGP logs aur label table batate hain kaunsa SID haara.</li>
<li>Routers ke beech SRGB compare karo. Alag SRGBs phir bhi kaam karte hain lekin confusion ka source hain; jis platform ka SRGB bahut chhota ho wahan high indexes fail hote hain.</li>
<li>Verify karo ki loopback prefix IGP mein advertised hai (passive interface, sahi process) aur SR sahi address family mein enabled hai.</li>
</ol>
<h3>Step 3: kya labels install hain aur forwarding kaam karti hai?</h3>
<ul>
<li>Label table: <code>show isis segment-routing label table</code> (XR). Har prefix-SID ka label SRGB base plus index ke barabar hona chahiye.</li>
<li>MPLS forwarding table: <code>show mpls forwarding</code> (XR) ya <code>show mpls forwarding-table</code> (XE) mein label, next hop aur outgoing interface dikhne chahiye. Entry missing ho to SR install nahi hua, jaise LDP preferred hai ya next hop SR support nahi karta.</li>
<li>Label path hop by hop test karne ke liye prefix-SID FEC par <code>ping sr-mpls</code> aur <code>traceroute sr-mpls</code> (XR) use karo.</li>
<li>Coexistence mein check karo kaunsa label (SR ya LDP) chuna gaya aur preference setting (<code>sr-prefer</code> ya <code>sr-label-preferred</code>).</li>
</ul>
<h3>Step 4: policies aur steering</h3>
<ul>
<li><code>show segment-routing traffic-eng policy</code> (XR) har policy, uski state (up ya down), active candidate path, preference aur segment list dikhata hai. Down policy wajah dikhati hai: no valid path, SID jo resolve nahi hota, ya MSD ke liye bahut gehri segment list.</li>
<li>Explicit lists: check karo har SID maujood hai aur current topology mein resolve hota hai. Dynamic paths: metric type aur constraints check karo (affinity names defined hain, link affinities set hain) aur endpoint database mein hai.</li>
<li>Steering: kya BGP route sahi color extended community carry karta hai, aur next hop us color wali policy ke endpoint ke barabar hai? Kya color ke liye ODN template maujood hai?</li>
<li>Traffic policy ignore kare to destination ke liye <code>show route</code> aur CEF dekho: next hop mein policy dikhni chahiye.</li>
</ul>
<h3>Step 5: protection</h3>
<ul>
<li><code>show isis fast-reroute detail</code> har protected prefix ke liye repair path type ke saath list karna chahiye. Jo prefixes unprotected dikhte hain woh aisi topology mein door ho sakte hain jahan SID depth kaafi nahi, ya chune gaye tiebreakers ke tahat loop-free repair nahi.</li>
<li>TI-LFA link ki dono sides par aur har core interface par enabled hona chahiye.</li>
<li>Microloops: check karo microloop avoidance enabled hai aur uske timers aapke convergence times se match karte hain.</li>
<li>Yaad rakho detection speed (loss of signal, BFD) total repair time tay karti hai.</li>
</ul>
<table class="cmp"><tr><th>Symptom</th><th>Pehla check</th><th>Likely cause</th></tr><tr><td>SID label table mein nahi</td><td>IS-IS database verbose</td><td>Advertise nahi hua, wide metrics missing, SID conflict</td></tr><tr><td>Label table mein hai, ping sr-mpls fail</td><td>Hop by hop forwarding table</td><td>Next hop mein SR nahi, SRGB mismatch, MTU</td></tr><tr><td>Traffic LDP use karta hai, SR nahi</td><td>Preference setting</td><td>sr-prefer missing, next hop SR-capable nahi</td></tr><tr><td>Policy down</td><td>Policy detail: reason</td><td>List mein invalid SID, constraints mein path nahi, MSD exceed</td></tr><tr><td>Route steer nahi hua</td><td>BGP route color aur next hop</td><td>Galat color, endpoint mismatch, ODN template nahi</td></tr><tr><td>Fast reroute nahi</td><td>fast-reroute detail</td><td>Dono sides par enabled nahi, MSD, tiebreaker bahut strict</td></tr></table>
<h3>LDP aur RSVP-TE se migration plan</h3>
<ol>
<li><b>Plan.</b> SRGB, indexes ka numbering plan, aur wide metrics wala IGP (IS-IS ya OSPF) chuno. Platform support aur MSD check karo.</li>
<li><b>IGP mein SR enable karo</b> saare core routers par, loopbacks ko prefix-SIDs do, LDP chalne do aur labels aur <code>ping sr-mpls</code> verify karo.</li>
<li><b>Preference set karo</b> (sr-prefer) taaki SR labels use hon jabki LDP safety net rahe. Non-SR devices ke liye mapping servers use karo.</li>
<li><b>TI-LFA aur microloop avoidance enable karo</b>, maintenance window mein failures test karo, phir manual MPLS-TE FRR backups retire karo.</li>
<li><b>RSVP-TE tunnels ko replace karo</b> SR policies ya colors wale ODN se, ek service ek samay mein.</li>
<li><b>LDP hatao</b> stable period ke baad core se, sirf jahan zaroori ho wahan rakho.</li>
</ol>
<div class="eg"><p><b>Worked example.</b> P router par SR enable karne ke baad PE1 ke label table mein PE7 ka prefix-SID 16007 missing hai. IS-IS database mein PE7 index 7 ke saath dikhta hai, lekin P2 bhi index 7 ke saath. P2 jeet gaya, isliye PE7 ne SID kho diya. Aap PE7 ko index 107 dete ho, label 16107 ho jaata hai, table expected next hop ke saath use dikhati hai, aur PE7 ko <code>ping sr-mpls</code> succeed hota hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Live network mein plan ke bina SRGB ya indexes badalna. Router par SRGB badalne se uske use kiye saare labels badalte hain, aur galat change traffic ko blackhole kar sakta hai. SID aur SRGB changes maintenance window mein, ek router ek samay mein karo, LDP ko fallback rakhte hue.</p></div>
<div class="exam"><p><b>Exam trap.</b> Questions aksar "SR label missing" jaisa symptom dete hain aur pehla check poochte hain. SID aur conflicts ke liye IGP database se shuru karo. Policy problems ke liye policy state aur color match dekho. Migration ke liye yaad rakho ki SR aur LDP coexist karte hain aur mapping server non-SR hisson ki madad karta hai.</p></div>
<div class="scn"><h4>Colour ka typo</h4><p>Naya video VPN apni low-latency policy use nahi kar raha tha. Policy up aur healthy thi, lekin route policy mein typo ki wajah se video routes par color 100 ki jagah 110 tha. Matching policy ya ODN template na hone se routes chupchaap IGP path par chale. Route policy theek karne se VPN ek minute mein policy par aa gaya.</p><p><b>Lesson:</b> SR-TE kuch nahi kar raha lage to policy ko blame karne se pehle BGP route ka color check karo.</p></div>
<div class="iv"><p class="q">"Router ke label table se SR prefix-SID missing hai. Kya check karoge?"</p><p>Pehle IGP: adjacency, wide metrics aur yeh ki originating router sach mein prefix-SID advertise karta hai, IS-IS database verbose form mein dekhkar. Phir SID conflicts (do prefixes ka same index) aur SRGB, kyunki block ke bahar ka index ya conflict SID hata deta hai. Phir forwarding table aur next hop ki SR capability, aur aakhir mein SR versus LDP preference. Main ping sr-mpls se test karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order mein troubleshoot karo: IGP, SIDs, labels aur forwarding, policy aur steering, protection.</li>
<li>SID conflicts aur missing wide metrics SIDs ke gayab hone ki sabse common wajah hain.</li>
<li>Up lekin unused policy mein aksar color ya next hop mismatch hota hai.</li>
<li>Steps mein migrate karo: LDP ke saath SR, SR prefer, TI-LFA, SR policies, phir LDP hatao.</li>
<li>SRGB aur index changes dhyan se plan karo; ping sr-mpls aur traceroute sr-mpls use karo.</li>
</ul></div>
`}};export{e as default};