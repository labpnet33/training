var e={id:`lifecycle-concepts`,h:{en:`Backup, upgrade, licensing and reports (concepts, not simulated)`,hi:`Backup, upgrade, licensing aur reports (concepts, simulated nahi)`},body:{en:`
<p>Owning a car is more than driving it. There is a service book, insurance papers, a spare key and an annual inspection. If you lose the key or the insurance lapses, the best driver in the world is still stuck. Running ClearPass in production has the same "paper side": configuration backups, software upgrades, licences and reports. In the lab you do <b>not</b> do these things: <b>they are concepts here, not simulated in the lab</b>. You still need to understand them, because interviews and real projects ask about them.</p>

<div class="note"><p><b>Honest scope.</b> The Policy Manager web GUI, its cluster (publisher and subscribers), Insight reports, backup and restore, upgrades and licensing are real product behaviour that the CONFIG lab models do not run. Exact menu names and options differ between ClearPass releases, so always follow the documentation of your version.</p></div>

<h3>Backup and restore</h3>
<p>A ClearPass configuration backup is a file that contains your configuration: services, enforcement policies, roles, network devices, local users, certificates and more. Typical options include a configuration-only backup and a backup that also includes logged data (such as Access Tracker records and Insight data), which is much larger. In the real product these live under the <b>Administration</b> area (Server Manager) and backups can be scheduled and sent to an external server.</p>
<ul>
<li><b>When to back up:</b> before any upgrade, before a large policy change, and on a regular schedule.</li>
<li><b>Where to keep it:</b> off the server. A backup on the failed disk helps nobody.</li>
<li><b>Restore:</b> returns the configuration of that moment. Test a restore on a lab or spare node at least once a year; an untested backup is only a hope.</li>
<li><b>Secrets:</b> a backup contains sensitive material (secrets, user data). Store and transfer it as a secret.</li>
</ul>
<p>For the AOS-CX switch the matching idea is the saved startup configuration (<code>write memory</code>, which the capstone uses) and a copy of the configuration kept off the switch.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Lifecycle concepts">
<rect x="10" y="20" width="145" height="80" rx="8" fill="#bae6fd"/><text x="82" y="48" text-anchor="middle" class="svg-ink" font-size="14">Backup</text><text x="82" y="68" text-anchor="middle" class="svg-muted" font-size="11">config, off-box,</text><text x="82" y="84" text-anchor="middle" class="svg-muted" font-size="11">tested restore</text>
<rect x="170" y="20" width="145" height="80" rx="8" fill="#ddd6fe"/><text x="242" y="48" text-anchor="middle" class="svg-ink" font-size="14">Upgrade</text><text x="242" y="68" text-anchor="middle" class="svg-muted" font-size="11">notes, backup,</text><text x="242" y="84" text-anchor="middle" class="svg-muted" font-size="11">window, verify</text>
<rect x="330" y="20" width="145" height="80" rx="8" fill="#fde68a"/><text x="402" y="48" text-anchor="middle" class="svg-ink" font-size="14">Licensing</text><text x="402" y="68" text-anchor="middle" class="svg-muted" font-size="11">platform + feature</text><text x="402" y="84" text-anchor="middle" class="svg-muted" font-size="11">capacity</text>
<rect x="490" y="20" width="140" height="80" rx="8" fill="#bbf7d0"/><text x="560" y="48" text-anchor="middle" class="svg-ink" font-size="14">Reports</text><text x="560" y="68" text-anchor="middle" class="svg-muted" font-size="11">Insight: trends,</text><text x="560" y="84" text-anchor="middle" class="svg-muted" font-size="11">audit, capacity</text>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="13">All four: NOT simulated in the lab. Know the idea, follow vendor docs.</text>
</svg><p class="cap">The paper side of running ClearPass.</p></div>

<h3>Upgrades</h3>
<p>A ClearPass upgrade moves the software to a newer release. Operators treat it as a planned change using the checklist of chapter 8:</p>
<ol>
<li><b>Read the release notes:</b> supported upgrade paths, minimum versions, hardware or VM requirements, known issues, changed behaviour.</li>
<li><b>Back up</b> the configuration (and take a VM snapshot if virtual) and confirm the backup is stored off the server.</li>
<li><b>Plan the window</b> and tell users; authentication may be briefly unavailable. In a cluster, follow the documented node order and keep at least one node serving requests where the design allows it; the NADs should list a second RADIUS server so switches fail over.</li>
<li><b>Upgrade, then verify:</b> services up, network devices still authenticating, a pilot user and a pilot device tested end to end, Event Viewer clean, Access Tracker showing normal Accept rates.</li>
<li><b>Have a fallback:</b> restore from the backup or snapshot if verification fails.</li>
</ol>
<p>Connect this to the lab: the <b>critical role</b> (module 5) is what keeps employees working if ClearPass is unreachable, so it is the safety net of an upgrade window on a single-server site.</p>

<h3>Licensing</h3>
<p>ClearPass is licensed in parts: a <b>platform</b> licence that enables the system and its size, and <b>feature</b> licences for areas such as access (authentication of endpoints), onboarding, posture (OnGuard) and others. Capacity is counted in endpoints or users depending on the licence type. Operationally you should know three things: licences can run out (new devices then may fail to be served, or you get warnings), licences are tied to the product and the server, and licence usage should be checked before onboarding thousands of new devices. In the real GUI the licensing page is in the Administration area. Exact counting rules depend on your contract and version, so verify with the vendor documentation.</p>

<h3>Insight and reports</h3>
<p><b>Insight</b> is the ClearPass reporting component: it stores authentication and accounting history for longer than the live Access Tracker view and builds scheduled reports (authentications per day, top failing users, device inventory). Use cases: audit ("who accessed what, when"), capacity planning, trend of failures after a change. The Access Tracker is for <i>now</i>, Insight is for <i>history</i>. Insight reports are not simulated in the lab.</p>

<h3>Other operational habits (concept)</h3>
<ul>
<li><b>Redundancy:</b> a publisher and subscribers form a cluster; configuration is made on the publisher and replicated. Switches list more than one RADIUS server.</li>
<li><b>Syslog and alerts:</b> send ClearPass events and switch logs to a central log system.</li>
<li><b>Certificate expiry:</b> the RADIUS/EAP server certificate expires; renew it before it does or every 802.1X client will fail validation at once.</li>
<li><b>Admin access control:</b> use named administrator accounts, not a shared one, and keep an audit trail.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Upgrade plan for a two-node cluster: Monday, back up and snapshot; Tuesday 22:00 window; upgrade the nodes in the order of the release notes; verify with alice, bob, PRN1 and CAM1; keep switches pointing to both servers; rollback decision at 23:30 if the pilot tests fail.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating the backup as done because the job ran. Check that the file exists off the server, its size is sensible and that someone has restored one at least once. Also: letting the server certificate expire silently is a classic cause of a company-wide 802.1X outage.</p></div>

<div class="exam"><p><b>Exam trap.</b> Backup/restore, upgrade and licensing are administration topics: they are not done inside a service, role mapping or enforcement policy. And the Access Tracker is not a long-term reporting tool; Insight is.</p></div>

<div class="scn"><h4>The expired certificate</h4><p>At 07:55 on a Monday all laptops failed 802.1X at once. Tracker rows showed failures with no password problem and the supplicants reported an untrusted server. The RADIUS server certificate had expired over the weekend. Renewal fixed it. A calendar reminder and a monitoring check were added.</p><p><b>Lesson:</b> time-based failures need time-based monitoring: certificates, licences and backups all have dates.</p></div>

<div class="iv"><p class="q">"What do you do before a ClearPass upgrade?"</p><p>Read the release notes and upgrade path, take and verify a configuration backup (and a snapshot for a VM), plan a window with the cluster order and a second RADIUS server on the switches, define a pilot test with a user and a device, and prepare a rollback. Afterwards I verify the Event Viewer and Access Tracker.</p></div>

<div class="kt"><p><b>Key takeaways</b></p>
<ul>
<li>Backup, restore, upgrade, licensing and Insight are concepts here: not simulated in the lab.</li>
<li>Back up before every upgrade, store off the server and test a restore.</li>
<li>Upgrades follow the change checklist, with release notes, window, pilot and fallback.</li>
<li>Licences are platform plus feature, counted by capacity; check before large onboarding.</li>
<li>Access Tracker is live view; Insight keeps history and reports.</li>
</ul></div>
`,hi:`
<p>Car rakhna sirf chalane tak nahi hota. Service book, insurance papers, spare key aur saalana inspection bhi hote hain. Chaabi kho jaaye ya insurance lapse ho jaaye, to duniya ka best driver bhi phans jaata hai. Production mein ClearPass chalane ka bhi aisa hi "paper side" hai: configuration backups, software upgrades, licences aur reports. Lab mein aap yeh cheezein <b>nahi</b> karte: <b>yeh yahan concepts hain, lab mein simulated nahi</b>. Phir bhi aapko inhe samajhna zaroori hai, kyunki interviews aur real projects inke baare mein poochte hain.</p>

<div class="note"><p><b>Honest scope.</b> Policy Manager web GUI, uska cluster (publisher aur subscribers), Insight reports, backup aur restore, upgrades aur licensing real product behaviour hain jinhe CONFIG lab models nahi chalate. Exact menu names aur options ClearPass releases ke beech alag hote hain, isliye hamesha apne version ka documentation follow karo.</p></div>

<h3>Backup aur restore</h3>
<p>ClearPass configuration backup ek file hai jisme aapki configuration hoti hai: services, enforcement policies, roles, network devices, local users, certificates aur bahut kuch. Typical options mein configuration-only backup aur ek backup jo logged data (jaise Access Tracker records aur Insight data) bhi include kare shamil hain, jo kaafi bada hota hai. Real product mein yeh <b>Administration</b> area (Server Manager) mein hote hain aur backups schedule karke external server par bheje ja sakte hain.</p>
<ul>
<li><b>Kab backup lena hai:</b> kisi bhi upgrade se pehle, bade policy change se pehle, aur regular schedule par.</li>
<li><b>Kahan rakhna hai:</b> server se bahar. Failed disk par rakha backup kisi kaam ka nahi.</li>
<li><b>Restore:</b> us moment ki configuration wapas deta hai. Saal mein kam se kam ek baar lab ya spare node par restore test karo; untested backup sirf ek umeed hai.</li>
<li><b>Secrets:</b> backup mein sensitive material hota hai (secrets, user data). Use secret ki tarah store aur transfer karo.</li>
</ul>
<p>AOS-CX switch ke liye matching idea saved startup configuration hai (<code>write memory</code>, jo capstone use karta hai) aur switch se bahar rakhi configuration ki copy.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Lifecycle concepts">
<rect x="10" y="20" width="145" height="80" rx="8" fill="#bae6fd"/><text x="82" y="48" text-anchor="middle" class="svg-ink" font-size="14">Backup</text><text x="82" y="68" text-anchor="middle" class="svg-muted" font-size="11">config, off-box,</text><text x="82" y="84" text-anchor="middle" class="svg-muted" font-size="11">tested restore</text>
<rect x="170" y="20" width="145" height="80" rx="8" fill="#ddd6fe"/><text x="242" y="48" text-anchor="middle" class="svg-ink" font-size="14">Upgrade</text><text x="242" y="68" text-anchor="middle" class="svg-muted" font-size="11">notes, backup,</text><text x="242" y="84" text-anchor="middle" class="svg-muted" font-size="11">window, verify</text>
<rect x="330" y="20" width="145" height="80" rx="8" fill="#fde68a"/><text x="402" y="48" text-anchor="middle" class="svg-ink" font-size="14">Licensing</text><text x="402" y="68" text-anchor="middle" class="svg-muted" font-size="11">platform + feature</text><text x="402" y="84" text-anchor="middle" class="svg-muted" font-size="11">capacity</text>
<rect x="490" y="20" width="140" height="80" rx="8" fill="#bbf7d0"/><text x="560" y="48" text-anchor="middle" class="svg-ink" font-size="14">Reports</text><text x="560" y="68" text-anchor="middle" class="svg-muted" font-size="11">Insight: trends,</text><text x="560" y="84" text-anchor="middle" class="svg-muted" font-size="11">audit, capacity</text>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="13">Chaaron: lab mein simulated NAHI. Idea jaano, vendor docs follow karo.</text>
</svg><p class="cap">ClearPass chalane ka paper side.</p></div>

<h3>Upgrades</h3>
<p>ClearPass upgrade software ko naye release par le jaata hai. Operators ise chapter 8 ki checklist wale planned change ki tarah treat karte hain:</p>
<ol>
<li><b>Release notes padho:</b> supported upgrade paths, minimum versions, hardware ya VM requirements, known issues, badla hua behaviour.</li>
<li><b>Backup lo</b> configuration ka (aur virtual ho to VM snapshot) aur confirm karo ki backup server se bahar store hai.</li>
<li><b>Window plan karo</b> aur users ko batao; authentication thodi der ke liye unavailable ho sakti hai. Cluster mein documented node order follow karo aur jahan design allow kare kam se kam ek node requests serve karta rahe; NADs ke paas doosra RADIUS server listed ho taaki switches fail over kar sakein.</li>
<li><b>Upgrade, phir verify:</b> services up, network devices abhi bhi authenticate kar rahe, ek pilot user aur pilot device end to end tested, Event Viewer clean, Access Tracker mein normal Accept rates.</li>
<li><b>Fallback taiyaar rakho:</b> verification fail ho to backup ya snapshot se restore.</li>
</ol>
<p>Lab se jodo: <b>critical role</b> (module 5) wahi hai jo ClearPass unreachable hone par employees ka kaam chalata rakhta hai, isliye single-server site par upgrade window ka safety net yahi hai.</p>

<h3>Licensing</h3>
<p>ClearPass hisson mein licensed hota hai: ek <b>platform</b> licence jo system aur uska size enable karta hai, aur <b>feature</b> licences access (endpoints ki authentication), onboarding, posture (OnGuard) aur doosre areas ke liye. Capacity licence type ke hisaab se endpoints ya users mein gini jaati hai. Operationally teen cheezein jaano: licences khatam ho sakte hain (tab naye devices serve nahi ho sakte, ya warnings aati hain), licences product aur server se bandhe hote hain, aur hazaaron naye devices onboard karne se pehle licence usage check karna chahiye. Real GUI mein licensing page Administration area mein hai. Exact counting rules aapke contract aur version par depend karte hain, isliye vendor documentation se verify karo.</p>

<h3>Insight aur reports</h3>
<p><b>Insight</b> ClearPass ka reporting component hai: yeh live Access Tracker view se zyada lamba authentication aur accounting history store karta hai aur scheduled reports banata hai (roz ki authentications, top failing users, device inventory). Use cases: audit ("kisne kab kya access kiya"), capacity planning, change ke baad failures ka trend. Access Tracker <i>abhi</i> ke liye hai, Insight <i>history</i> ke liye. Insight reports lab mein simulated nahi hain.</p>

<h3>Doosri operational aadatein (concept)</h3>
<ul>
<li><b>Redundancy:</b> publisher aur subscribers cluster banate hain; configuration publisher par hoti hai aur replicate hoti hai. Switches ek se zyada RADIUS server list karte hain.</li>
<li><b>Syslog aur alerts:</b> ClearPass events aur switch logs central log system ko bhejo.</li>
<li><b>Certificate expiry:</b> RADIUS/EAP server certificate expire hota hai; usse pehle renew karo warna har 802.1X client ek saath validation fail karega.</li>
<li><b>Admin access control:</b> named administrator accounts use karo, shared nahi, aur audit trail rakho.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Do-node cluster ka upgrade plan: Monday backup aur snapshot; Tuesday 22:00 window; release notes ke order mein nodes upgrade; alice, bob, PRN1 aur CAM1 se verify; switches dono servers ko point karte rahein; pilot tests fail hon to 23:30 par rollback decision.</p></div>

<div class="warn"><p><b>Common mistake.</b> Backup job chal gaya to backup done maan lena. Check karo ki file server se bahar hai, size theek hai aur kisi ne kam se kam ek baar restore kiya hai. Aur: server certificate ka chupchaap expire hona company-wide 802.1X outage ka classic cause hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Backup/restore, upgrade aur licensing administration topics hain: yeh kisi service, role mapping ya enforcement policy ke andar nahi hote. Aur Access Tracker long-term reporting tool nahi hai; Insight hai.</p></div>

<div class="scn"><h4>Expired certificate</h4><p>Monday 07:55 par saare laptops ek saath 802.1X mein fail ho gaye. Tracker rows mein failures the par password ki koi problem nahi thi aur supplicants ne untrusted server report kiya. RADIUS server certificate weekend mein expire ho chuka tha. Renewal ne fix kiya. Calendar reminder aur monitoring check add kiye gaye.</p><p><b>Lesson:</b> time-based failures ke liye time-based monitoring chahiye: certificates, licences aur backups sab ki dates hoti hain.</p></div>

<div class="iv"><p class="q">"ClearPass upgrade se pehle aap kya karte ho?"</p><p>Release notes aur upgrade path padhta hoon, configuration backup lekar verify karta hoon (VM ke liye snapshot bhi), cluster order aur switches par doosre RADIUS server ke saath window plan karta hoon, ek user aur ek device ka pilot test define karta hoon, aur rollback taiyaar rakhta hoon. Baad mein Event Viewer aur Access Tracker verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p>
<ul>
<li>Backup, restore, upgrade, licensing aur Insight yahan concepts hain: lab mein simulated nahi.</li>
<li>Har upgrade se pehle backup lo, server se bahar rakho aur restore test karo.</li>
<li>Upgrades change checklist follow karte hain: release notes, window, pilot aur fallback.</li>
<li>Licences platform plus feature hote hain, capacity se gine jaate hain; bade onboarding se pehle check karo.</li>
<li>Access Tracker live view hai; Insight history aur reports rakhta hai.</li>
</ul></div>
`}};export{e as default};