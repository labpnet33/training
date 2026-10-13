var e={id:`bgp`,h:{en:`BGP on a virtual router: peers, groups and verification`,hi:`Virtual router par BGP: peers, groups aur verification`},body:{en:`
<p>BGP is the protocol of the internet and of many multi-site enterprises. It runs over TCP port 179 between configured neighbours and chooses paths by attributes, not by a simple metric. Theory is in enarsi-bgp; here is how PAN-OS organises it.</p>
<div class="note"><p><b>Note.</b> Everything in this chapter is a reference configuration (not run in the simulator). AS numbers are private (65010, 65100) and addresses are documentation ranges.</p></div>
<h3>Building blocks</h3>
<ul>
<li><b>Local AS and router ID</b>: set once under the virtual router BGP settings.</li>
<li><b>Peer group</b>: a bundle of peers with the same type (EBGP or IBGP) and shared policy.</li>
<li><b>Peer</b>: one neighbour with its remote AS, its address and the local interface and address used for the TCP session.</li>
<li><b>Policy</b>: import and export rules, aggregation, conditional advertisement.</li>
<li><b>Redistribution rules</b>: which non-BGP routes the firewall injects into BGP.</li>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="BGP builds a TCP session to each configured peer inside a peer group, then exchanges prefixes."><rect x="20" y="40" width="132" height="80" rx="10" fill="#bae6fd"/><text x="86" y="76" text-anchor="middle" class="svg-ink" font-size="14">Firewall</text><text x="86" y="98" text-anchor="middle" class="svg-muted" font-size="12">AS 65010</text><line x1="152" y1="80" x2="176" y2="80" stroke="#64748b" stroke-width="2"/><rect x="176" y="40" width="132" height="80" rx="10" fill="#bbf7d0"/><text x="242" y="76" text-anchor="middle" class="svg-ink" font-size="14">Peer group</text><text x="242" y="98" text-anchor="middle" class="svg-muted" font-size="12">ISP</text><line x1="308" y1="80" x2="332" y2="80" stroke="#64748b" stroke-width="2"/><rect x="332" y="40" width="132" height="80" rx="10" fill="#ddd6fe"/><text x="398" y="76" text-anchor="middle" class="svg-ink" font-size="14">ISP router</text><text x="398" y="98" text-anchor="middle" class="svg-muted" font-size="12">AS 65100</text><line x1="464" y1="80" x2="488" y2="80" stroke="#64748b" stroke-width="2"/><rect x="488" y="40" width="132" height="80" rx="10" fill="#fde68a"/><text x="554" y="76" text-anchor="middle" class="svg-ink" font-size="14">Routes</text><text x="554" y="98" text-anchor="middle" class="svg-muted" font-size="12">exchanged</text></svg><p class="cap">BGP builds a TCP session to each configured peer inside a peer group, then exchanges prefixes.</p></div>
</ul>
<h3>Minimal EBGP configuration</h3>
<pre class="code">set network virtual-router default protocol bgp enable yes
set network virtual-router default protocol bgp router-id 10.0.0.1
set network virtual-router default protocol bgp local-as 65010
set network virtual-router default protocol bgp peer-group ISP type ebgp
set network virtual-router default protocol bgp peer-group ISP peer ISP-A peer-as 65100
set network virtual-router default protocol bgp peer-group ISP peer ISP-A local-address interface ethernet1/1 ip 203.0.113.2/30
set network virtual-router default protocol bgp peer-group ISP peer ISP-A peer-address ip 203.0.113.1
set network virtual-router default protocol bgp peer-group ISP peer ISP-A enable yes
commit</pre>
<p>Add an authentication profile with an MD5 key (from your vault) on sessions that cross a provider network, and set a sensible hold time and keepalive. Enable BFD only when both ends support it and you have tested it, because an aggressive timer on a busy firewall can create flaps.</p>
<h3>Path selection in short</h3>
<p>BGP picks one best path per prefix using ordered attributes: highest <b>local preference</b>, shortest <b>AS path</b>, lowest <b>MED</b> (when from the same neighbouring AS), EBGP over IBGP, and then router ID as a last tie-break. Local preference stays inside your AS and is the usual way to choose an exit. AS path prepending influences how others reach you.</p>
<h3>IBGP and scale</h3>
<p>Inside one AS, IBGP peers must be fully meshed unless you use <b>route reflection</b> (a reflector client setting) or <b>confederations</b>. IBGP does not change the next hop by default, so the next hop must be reachable through the IGP. Branch firewalls with a single ISP rarely need either.</p>
<h3>Default route from an ISP</h3>
<p>Most ISPs send a default route or the full table. Never accept the full table on a small firewall unless the platform is sized for it. Accept only a default route and your own prefixes by filtering on import. The option to install a default route learned by BGP is controlled in the BGP settings and by an import rule that permits it.</p>
<h3>Verification commands</h3>
<pre class="code">show routing protocol bgp summary
show routing protocol bgp peer
show routing protocol bgp loc-rib
show routing protocol bgp rib-out
show routing route type bgp</pre>
<p>Session states in order: Idle, Connect, Active, OpenSent, OpenConfirm, Established. A peer stuck in Active or Connect cannot complete TCP; Idle often means an administrative or configuration problem such as a wrong AS. Only Established exchanges routes. Check the route table with the flag <code>B</code>.</p>
<h3>Policy and zones</h3>
<p>BGP traffic to the firewall is subject to security policy and zone protection. Put the ISP-facing interface in an untrust zone, allow the <code>bgp</code> application from the peer address to the interface, and keep it as narrow as possible. Do not enable an interface management profile on the internet-facing port.</p>
<div class="eg"><p><b>Worked example.</b> Peer 203.0.113.1 (AS 65100) advertises 0.0.0.0/0 with local preference 100. The firewall (AS 65010) receives it, passes it through an import rule and installs it as a default route with EBGP distance 20. A static default route with the default distance 10 would still win, so remove it or raise its distance above 20 if BGP must lead.</p></div>
<div class="warn"><p><b>Common mistake.</b> Using the wrong peer-as, or sourcing the session from the wrong interface address, leaves the session in Idle or Active. The peer must also be configured with your AS and address.</p></div>
<div class="exam"><p><b>Exam trap.</b> EBGP defaults to distance 20 and IBGP to 200. IBGP does not change the next hop by default, and an IBGP route learned from another IBGP peer is not re-advertised without a reflector.</p></div>
<div class="scn"><h4>Two ISPs, one default route wins</h4><p>A data centre firewall peered with ISP A and ISP B and used ISP B for all outbound traffic, although the team wanted ISP A. Both sent a default route. The engineer found equal local preference, so BGP fell to a lower-priority tie-break. An import rule on ISP A raised local preference to 200 and traffic moved. The team documented the preference in the design.</p><p><b>Lesson:</b> choose your exit with local preference, not by accident of a tie-break.</p></div>
<div class="iv"><p class="q">"How does a firewall choose between two default routes learned by BGP?"</p><p>By the BGP decision process: highest local preference first, then shortest AS path, then lowest MED, EBGP over IBGP and finally lowest router ID. Say that you control outbound choice with local preference in an import rule, and inbound with prepending or MED.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>BGP uses TCP 179 between explicitly configured peers.</li><li>A peer group holds type and policy; each peer has its own AS and addresses.</li><li>Local preference chooses the exit; prepend and MED influence inbound traffic.</li><li>Only Established sessions exchange routes; Active often means no TCP.</li><li>EBGP distance is 20, IBGP 200; security policy must allow the bgp application.</li></ul></div>
`,hi:`
<p>BGP internet ka protocol hai aur kai multi-site enterprises ka bhi. Yeh TCP port 179 par configured neighbours ke beech chalta hai aur paths ko simple metric se nahi, attributes se chunta hai. Theory enarsi-bgp mein hai; yahan dekhte hain PAN-OS ise kaise organise karta hai.</p>
<div class="note"><p><b>Note.</b> Is chapter ka sab kuch reference configuration hai (simulator mein nahi chalta). AS numbers private hain (65010, 65100) aur addresses documentation ranges hain.</p></div>
<h3>Building blocks</h3>
<ul>
<li><b>Local AS aur router ID</b>: virtual router ki BGP settings mein ek baar set hote hain.</li>
<li><b>Peer group</b>: same type (EBGP ya IBGP) aur shared policy wale peers ka bundle.</li>
<li><b>Peer</b>: ek neighbour, uska remote AS, address, aur TCP session ke liye local interface aur address.</li>
<li><b>Policy</b>: import aur export rules, aggregation, conditional advertisement.</li>
<li><b>Redistribution rules</b>: firewall kaunse non-BGP routes BGP mein inject karta hai.</li>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="BGP peer group ke har configured peer ke saath TCP session banata hai, phir prefixes exchange karta hai."><rect x="20" y="40" width="132" height="80" rx="10" fill="#bae6fd"/><text x="86" y="76" text-anchor="middle" class="svg-ink" font-size="14">Firewall</text><text x="86" y="98" text-anchor="middle" class="svg-muted" font-size="12">AS 65010</text><line x1="152" y1="80" x2="176" y2="80" stroke="#64748b" stroke-width="2"/><rect x="176" y="40" width="132" height="80" rx="10" fill="#bbf7d0"/><text x="242" y="76" text-anchor="middle" class="svg-ink" font-size="14">Peer group</text><text x="242" y="98" text-anchor="middle" class="svg-muted" font-size="12">ISP</text><line x1="308" y1="80" x2="332" y2="80" stroke="#64748b" stroke-width="2"/><rect x="332" y="40" width="132" height="80" rx="10" fill="#ddd6fe"/><text x="398" y="76" text-anchor="middle" class="svg-ink" font-size="14">ISP router</text><text x="398" y="98" text-anchor="middle" class="svg-muted" font-size="12">AS 65100</text><line x1="464" y1="80" x2="488" y2="80" stroke="#64748b" stroke-width="2"/><rect x="488" y="40" width="132" height="80" rx="10" fill="#fde68a"/><text x="554" y="76" text-anchor="middle" class="svg-ink" font-size="14">Routes</text><text x="554" y="98" text-anchor="middle" class="svg-muted" font-size="12">exchange</text></svg><p class="cap">BGP peer group ke har configured peer ke saath TCP session banata hai, phir prefixes exchange karta hai.</p></div>
</ul>
<h3>Minimal EBGP configuration</h3>
<pre class="code">set network virtual-router default protocol bgp enable yes
set network virtual-router default protocol bgp router-id 10.0.0.1
set network virtual-router default protocol bgp local-as 65010
set network virtual-router default protocol bgp peer-group ISP type ebgp
set network virtual-router default protocol bgp peer-group ISP peer ISP-A peer-as 65100
set network virtual-router default protocol bgp peer-group ISP peer ISP-A local-address interface ethernet1/1 ip 203.0.113.2/30
set network virtual-router default protocol bgp peer-group ISP peer ISP-A peer-address ip 203.0.113.1
set network virtual-router default protocol bgp peer-group ISP peer ISP-A enable yes
commit</pre>
<p>Provider network cross karne wale sessions par vault se MD5 key ke saath authentication profile lagao, aur sensible hold time aur keepalive rakho. BFD tab hi enable karo jab dono ends support karein aur aapne test kiya ho, kyunki busy firewall par aggressive timer flaps bana sakta hai.</p>
<h3>Path selection short mein</h3>
<p>BGP har prefix ke liye ek best path ordered attributes se chunta hai: sabse high <b>local preference</b>, sabse chhota <b>AS path</b>, sabse kam <b>MED</b> (same neighbouring AS se aaye to), IBGP ke upar EBGP, aur akhir mein router ID. Local preference aapke AS ke andar rehta hai aur exit chunne ka aam tareeka hai. AS path prepending dusron ke aap tak pahunchne ko influence karta hai.</p>
<h3>IBGP aur scale</h3>
<p>Ek AS ke andar IBGP peers fully meshed hone chahiye jab tak <b>route reflection</b> (reflector client setting) ya <b>confederations</b> use na karo. IBGP default mein next hop nahi badalta, isliye next hop IGP se reachable hona chahiye. Ek ISP wale branch firewalls ko inki kam hi zaroorat hoti hai.</p>
<h3>ISP se default route</h3>
<p>Zyadatar ISPs default route ya full table bhejte hain. Chhote firewall par full table kabhi accept mat karo jab tak platform us size ka na ho. Import par filter karke sirf default route aur apne prefixes accept karo. BGP se seekha default route install karne ka option BGP settings aur use permit karne wale import rule se control hota hai.</p>
<h3>Verification commands</h3>
<pre class="code">show routing protocol bgp summary
show routing protocol bgp peer
show routing protocol bgp loc-rib
show routing protocol bgp rib-out
show routing route type bgp</pre>
<p>Session states kram se: Idle, Connect, Active, OpenSent, OpenConfirm, Established. Active ya Connect mein atka peer TCP complete nahi kar pa raha; Idle aksar administrative ya configuration problem hoti hai jaise galat AS. Sirf Established routes exchange karta hai. Route table mein flag <code>B</code> dekho.</p>
<h3>Policy aur zones</h3>
<p>Firewall tak aane wala BGP traffic security policy aur zone protection ke under hota hai. ISP-facing interface ko untrust zone mein rakho, peer address se interface tak <code>bgp</code> application allow karo, aur jitna ho sake narrow rakho. Internet-facing port par interface management profile enable mat karo.</p>
<div class="eg"><p><b>Worked example.</b> Peer 203.0.113.1 (AS 65100) 0.0.0.0/0 local preference 100 ke saath advertise karta hai. Firewall (AS 65010) use import rule se pass karke EBGP distance 20 ke saath default route install karta hai. Lekin distance 10 wala static default isse jeet jaata hai. BGP ko lead karna ho to static ko hatao ya 20 se upar karo.</p></div>
<div class="warn"><p><b>Common mistake.</b> Galat peer-as ya session ko galat interface address se source karna session ko Idle ya Active mein rakhta hai. Peer par bhi aapka AS aur address sahi configured hona chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> EBGP ki default distance 20 aur IBGP ki 200 hai. IBGP default mein next hop nahi badalta, aur doosre IBGP peer se seekha IBGP route reflector ke bina re-advertise nahi hota.</p></div>
<div class="scn"><h4>Do ISPs, ek default route jeetta hai</h4><p>Data centre firewall ISP A aur ISP B dono se peer tha aur saara outbound ISP B se ja raha tha, jabki team ISP A chahti thi. Dono ne default route bheja tha. Engineer ko equal local preference mila, isliye BGP lower-priority tie-break par gaya. ISP A ke import rule ne local preference 200 kiya aur traffic shift ho gaya. Team ne design mein preference document kiya.</p><p><b>Lesson:</b> exit local preference se chuno, tie-break ke ittefaq se nahi.</p></div>
<div class="iv"><p class="q">"Firewall BGP se seekhe do default routes mein se ek kaise chunta hai?"</p><p>BGP decision process se: pehle sabse high local preference, phir sabse chhota AS path, phir sabse kam MED, IBGP par EBGP, aur akhir mein sabse kam router ID. Batao ki outbound choice import rule ke local preference se control karte ho, aur inbound ko prepending ya MED se.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>BGP explicitly configured peers ke beech TCP 179 use karta hai.</li><li>Peer group type aur policy rakhta hai; har peer ka apna AS aur addresses hote hain.</li><li>Local preference exit chunta hai; prepend aur MED inbound ko influence karte hain.</li><li>Sirf Established session routes exchange karta hai; Active aksar TCP na bann paana hota hai.</li><li>EBGP distance 20, IBGP 200; security policy mein bgp application allow hona chahiye.</li></ul></div>
`}};export{e as default};