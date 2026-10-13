var e={id:`zones-and-mapping`,h:{en:`Zones: Trust, Untrust, Clientless VPN and zone mapping`,hi:`Zones: Trust, Untrust, Clientless VPN aur zone mapping`},body:{en:`
<p>A zone is like a colour-coded wristband at a festival. Staff do not check every person by name at every door; they look at the wristband colour and decide who may enter which area. In Prisma Access, rules look at the zone of the source and the zone of the destination. If a destination carries the wrong wristband, no rule written for the right wristband will ever see it.</p>

<h3>The three zones Prisma Access creates</h3>
<table class="cmp">
<tr><th>Zone</th><th>Meaning</th><th>What you can change</th></tr>
<tr><td>Trust</td><td>Networks you trust: your users, your data centre, your branch networks.</td><td>You decide which mapped zones are placed here.</td></tr>
<tr><td>Untrust</td><td>The internet and anything not explicitly trusted.</td><td>Default home of every mapped zone.</td></tr>
<tr><td>Clientless VPN</td><td>Traffic from Clientless VPN users.</td><td>Maps to trust and cannot be changed.</td></tr>
</table>
<p>Policy is enforced between the trust and untrust zones. The documentation tells you not to write any-to-any rules; use the zones to describe what you mean.</p>

<h3>Mapped zones default to untrust</h3>
<p>Your own network has zone names too. A firewall at the branch might call its LAN zone <code>lan</code> and its tunnel zone <code>vpn</code>. When these zones are brought into Prisma Access (for a remote network or for the data centre behind a service connection), Prisma Access calls them <b>mapped zones</b>. The rule is simple and safe: <b>every mapped zone starts as untrust</b>. A safe default prevents accidental trust, but it also means internal and data-centre destinations are untrusted until you act.</p>
<p>To make internal resources reachable by policy, you move the zones that lead to internal or data-centre resources to the <b>Trusted Zones</b> list. On Panorama this is the Zone Mapping settings. For remote networks the zones also appear under Templates, Network, Zones of the remote network template.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Zone mapping">
<rect x="20" y="20" width="170" height="50" rx="8" fill="#e2e8f0"/><text x="105" y="50" text-anchor="middle" class="svg-ink" font-size="13">Mapped zone: HQ-DC</text>
<rect x="20" y="90" width="170" height="50" rx="8" fill="#e2e8f0"/><text x="105" y="120" text-anchor="middle" class="svg-ink" font-size="13">Mapped zone: Branch-LAN</text>
<rect x="20" y="150" width="170" height="50" rx="8" fill="#e2e8f0"/><text x="105" y="180" text-anchor="middle" class="svg-ink" font-size="13">Mapped zone: Internet</text>
<rect x="300" y="20" width="150" height="80" rx="8" fill="#bbf7d0"/><text x="375" y="55" text-anchor="middle" class="svg-ink" font-size="14">Trust</text><text x="375" y="78" text-anchor="middle" class="svg-muted" font-size="12">moved by you</text>
<rect x="300" y="120" width="150" height="80" rx="8" fill="#fed7aa"/><text x="375" y="155" text-anchor="middle" class="svg-ink" font-size="14">Untrust</text><text x="375" y="178" text-anchor="middle" class="svg-muted" font-size="12">default</text>
<line x1="190" y1="45" x2="300" y2="55" stroke="#64748b" stroke-width="2"/><line x1="190" y1="115" x2="300" y2="75" stroke="#64748b" stroke-width="2"/><line x1="190" y1="175" x2="300" y2="165" stroke="#64748b" stroke-width="2"/>
<text x="545" y="60" text-anchor="middle" class="svg-muted" font-size="12">internal rules</text><text x="545" y="160" text-anchor="middle" class="svg-muted" font-size="12">internet rules</text>
</svg><p class="cap">Mapped zones land in untrust unless you move them to trusted zones. HQ-DC and Branch-LAN are moved; Internet stays.</p></div>

<h3>Reserved names</h3>
<p>Some names are reserved and cannot be used for your own zones: <code>trust</code>, <code>untrust</code>, <code>inter-fw</code>, and the names of your remote networks. Pick descriptive names such as <code>hq-dc</code> and <code>branch-lan</code> in your own firewall configuration so mapping is obvious later.</p>

<h3>Worked example for the lab</h3>
<div class="eg"><p>The HQ firewall HQ-FW (WAN 192.0.2.10, LAN 10.10.0.1/24) protects the app server 10.10.0.50 and Panorama 10.10.0.10. The data-centre side of the service connection is a mapped zone named <code>hq-dc</code>. At first it is untrust. A rule written as "destination zone trust, destination address 10.10.0.50, application ssl" does not match anything. After you move <code>hq-dc</code> into the trusted zones list and push the configuration, the same destination is now trust and the rule matches. The branch LAN 10.20.0.0/24 behind BR-FW (WAN 198.51.100.10) follows the same logic.</p></div>

<h3>How to do it, in order</h3>
<ol>
<li>List every network that connects: data centre, branches, anything behind a service connection.</li>
<li>Decide which of them are internal and trusted, and which are the internet.</li>
<li>Move the internal mapped zones to Trusted Zones; leave internet-facing ones in untrust.</li>
<li>Push the configuration (SCM Push Config, or Commit and Push on Panorama) and wait for in-sync status.</li>
<li>Only then write the rules that name those zones.</li>
</ol>
<pre class="code"><span class="c"># Planning table before you click anything (teaching format)</span>
hq-dc        -&gt; trusted   (10.10.0.0/24, app 10.10.0.50)
branch-lan   -&gt; trusted   (10.20.0.0/24)
internet     -&gt; untrust   (default, no change)</pre>

<p>After the change, a traffic log for a request to 10.10.0.50 shows the destination zone. That column is your proof that the mapping worked.</p>
<pre class="out">Time      Src IP        Dst IP       Dst Zone   App   Rule             Action
10:42:05  10.200.0.7    10.10.0.50   <span class="hl">trust</span>      ssl   allow-hq-app     allow</pre>

<div class="warn"><p><b>Common mistakes.</b> Leaving data-centre zones in untrust and then writing trust rules; moving an internet-facing zone to trusted "to make it work", which quietly trusts the internet; forgetting to push after mapping; using a reserved name for your own zone.</p></div>
<div class="exam"><p><b>Exam trap.</b> Clientless VPN maps to trust and that cannot be changed. And the default for mapped zones is untrust, not trust. If a question says internal resources are unreachable after onboarding, check the zone mapping first.</p></div>

<div class="scn"><h4>The branch printer server</h4><p>A new branch zone was onboarded and users could browse the web but could not reach a branch print server from the mobile pool. The rule allowed the mobile user subnet to the trust zone. The traffic log showed the destination zone as untrust, so the allow rule never matched and the flow fell to a generic web rule that did not know the print application. The engineer moved the branch zone to trusted, pushed, and printing worked.</p><p><b>Lesson:</b> check the destination zone column in the log before changing rules.</p></div>

<div class="iv"><p class="q">"Users cannot reach a data-centre app after onboarding. What do you check?"</p><p>Zone mapping. Mapped zones default to untrust, so the data-centre zone must be moved to trusted before trust-based rules match. Then check the rule, then the push status. Name the traffic log destination zone column as your evidence.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Prisma Access creates Trust, Untrust and Clientless VPN.</li>
<li>Mapped zones are untrust by default; you move internal ones to trusted.</li>
<li>Clientless VPN maps to trust and cannot be changed.</li>
<li>Reserved names: trust, untrust, inter-fw and remote network names.</li>
<li>Map zones and push before writing rules; verify with the destination zone in the log.</li>
</ul></div>
`,hi:`
<p>Zone ko festival ke colour-coded wristband jaisa samjho. Staff har door par har insaan ko naam se nahi check karta; wristband ka colour dekh kar decide karta hai ki kaun kis area mein ja sakta hai. Prisma Access mein rules source ka zone aur destination ka zone dekhte hain. Destination par galat wristband ho to sahi wristband ke liye likha koi rule use kabhi dekhega hi nahi.</p>

<h3>Prisma Access ke banaye teen zones</h3>
<table class="cmp">
<tr><th>Zone</th><th>Matlab</th><th>Aap kya badal sakte ho</th></tr>
<tr><td>Trust</td><td>Wo networks jin par aap bharosa karte ho: aapke users, data centre, branch networks.</td><td>Aap decide karte ho kaunse mapped zones yahan rakhne hain.</td></tr>
<tr><td>Untrust</td><td>Internet aur wo sab jo explicitly trusted nahi.</td><td>Har mapped zone ka default ghar.</td></tr>
<tr><td>Clientless VPN</td><td>Clientless VPN users ka traffic.</td><td>Trust se map hota hai aur badla nahi ja sakta.</td></tr>
</table>
<p>Policy trust aur untrust zones ke beech enforce hoti hai. Documentation kehti hai any-to-any rules mat likho; apni baat zones se describe karo.</p>

<h3>Mapped zones default mein untrust</h3>
<p>Aapke apne network mein bhi zone names hote hain. Branch firewall apne LAN zone ko <code>lan</code> aur tunnel zone ko <code>vpn</code> keh sakta hai. Jab ye zones Prisma Access mein aate hain (remote network ke liye ya service connection ke peeche data centre ke liye), Prisma Access unhe <b>mapped zones</b> kehta hai. Rule simple aur safe hai: <b>har mapped zone untrust se shuru hota hai</b>. Safe default accidental trust rokta hai, lekin iska matlab ye bhi hai ki internal aur data-centre destinations tab tak untrusted rehte hain jab tak aap action na lo.</p>
<p>Internal resources ko policy se reachable banane ke liye, jo zones internal ya data-centre resources tak le jaate hain unhe <b>Trusted Zones</b> list mein move karte hain. Panorama par ye Zone Mapping settings hain. Remote networks ke liye zones remote network template ke Templates, Network, Zones mein bhi dikhte hain.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Zone mapping">
<rect x="20" y="20" width="170" height="50" rx="8" fill="#e2e8f0"/><text x="105" y="50" text-anchor="middle" class="svg-ink" font-size="13">Mapped zone: HQ-DC</text>
<rect x="20" y="90" width="170" height="50" rx="8" fill="#e2e8f0"/><text x="105" y="120" text-anchor="middle" class="svg-ink" font-size="13">Mapped zone: Branch-LAN</text>
<rect x="20" y="150" width="170" height="50" rx="8" fill="#e2e8f0"/><text x="105" y="180" text-anchor="middle" class="svg-ink" font-size="13">Mapped zone: Internet</text>
<rect x="300" y="20" width="150" height="80" rx="8" fill="#bbf7d0"/><text x="375" y="55" text-anchor="middle" class="svg-ink" font-size="14">Trust</text><text x="375" y="78" text-anchor="middle" class="svg-muted" font-size="12">aap move karte ho</text>
<rect x="300" y="120" width="150" height="80" rx="8" fill="#fed7aa"/><text x="375" y="155" text-anchor="middle" class="svg-ink" font-size="14">Untrust</text><text x="375" y="178" text-anchor="middle" class="svg-muted" font-size="12">default</text>
<line x1="190" y1="45" x2="300" y2="55" stroke="#64748b" stroke-width="2"/><line x1="190" y1="115" x2="300" y2="75" stroke="#64748b" stroke-width="2"/><line x1="190" y1="175" x2="300" y2="165" stroke="#64748b" stroke-width="2"/>
<text x="545" y="60" text-anchor="middle" class="svg-muted" font-size="12">internal rules</text><text x="545" y="160" text-anchor="middle" class="svg-muted" font-size="12">internet rules</text>
</svg><p class="cap">Mapped zones untrust mein jaate hain jab tak aap unhe trusted zones mein move na karo. HQ-DC aur Branch-LAN move kiye gaye; Internet wahin rehta hai.</p></div>

<h3>Reserved names</h3>
<p>Kuch names reserved hain aur aapke apne zones ke liye use nahi ho sakte: <code>trust</code>, <code>untrust</code>, <code>inter-fw</code>, aur aapke remote networks ke names. Apni firewall configuration mein <code>hq-dc</code> aur <code>branch-lan</code> jaise descriptive names rakho taaki mapping baad mein obvious rahe.</p>

<h3>Lab ke liye worked example</h3>
<div class="eg"><p>HQ firewall HQ-FW (WAN 192.0.2.10, LAN 10.10.0.1/24) app server 10.10.0.50 aur Panorama 10.10.0.10 ko protect karta hai. Service connection ka data-centre side ek mapped zone hai jiska naam <code>hq-dc</code> hai. Shuru mein wo untrust hai. "Destination zone trust, destination address 10.10.0.50, application ssl" jaisa rule kuch match nahi karta. <code>hq-dc</code> ko trusted zones list mein move karke configuration push karne ke baad wahi destination ab trust hai aur rule match hota hai. BR-FW (WAN 198.51.100.10) ke peeche branch LAN 10.20.0.0/24 par bhi yahi logic lagta hai.</p></div>

<h3>Order mein kaise karein</h3>
<ol>
<li>Jo jo network connect hota hai uski list banao: data centre, branches, service connection ke peeche ka sab kuch.</li>
<li>Decide karo ki kaunse internal aur trusted hain, aur kaunse internet.</li>
<li>Internal mapped zones ko Trusted Zones mein move karo; internet-facing ko untrust mein rehne do.</li>
<li>Configuration push karo (SCM Push Config, ya Panorama par Commit and Push) aur in-sync status ka wait karo.</li>
<li>Uske baad hi un zones ke naam wale rules likho.</li>
</ol>
<pre class="code"><span class="c"># Kuch click karne se pehle planning table (teaching format)</span>
hq-dc        -&gt; trusted   (10.10.0.0/24, app 10.10.0.50)
branch-lan   -&gt; trusted   (10.20.0.0/24)
internet     -&gt; untrust   (default, no change)</pre>

<p>Change ke baad 10.10.0.50 ki request ka traffic log destination zone dikhata hai. Wo column aapka proof hai ki mapping kaam kar gayi.</p>
<pre class="out">Time      Src IP        Dst IP       Dst Zone   App   Rule             Action
10:42:05  10.200.0.7    10.10.0.50   <span class="hl">trust</span>      ssl   allow-hq-app     allow</pre>

<div class="warn"><p><b>Common mistakes.</b> Data-centre zones ko untrust mein chhod kar trust rules likhna; "chalane ke liye" internet-facing zone ko trusted mein daal dena, jo chupke se internet par bharosa kar leta hai; mapping ke baad push bhoolna; apne zone ke liye reserved name use karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Clientless VPN trust se map hota hai aur ye badla nahi ja sakta. Aur mapped zones ka default untrust hai, trust nahi. Question kahe ki onboarding ke baad internal resources unreachable hain, to pehle zone mapping check karo.</p></div>

<div class="scn"><h4>Branch print server</h4><p>Naya branch zone onboard hua aur users web browse kar paa rahe the lekin mobile pool se branch print server tak nahi pahunch paa rahe the. Rule mobile user subnet ko trust zone tak allow karta tha. Traffic log mein destination zone untrust dikha, isliye allow rule kabhi match nahi hua aur flow ek generic web rule par gaya jo print application ko nahi jaanta tha. Engineer ne branch zone ko trusted mein move kiya, push kiya, aur printing chal padi.</p><p><b>Lesson:</b> rules badalne se pehle log ka destination zone column dekho.</p></div>

<div class="iv"><p class="q">"Onboarding ke baad users data-centre app tak nahi pahunch paa rahe. Kya check karoge?"</p><p>Zone mapping. Mapped zones default mein untrust hote hain, isliye trust-based rules match hone se pehle data-centre zone ko trusted mein move karna padta hai. Phir rule check karo, phir push status. Evidence ke taur par traffic log ka destination zone column batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Prisma Access Trust, Untrust aur Clientless VPN banata hai.</li>
<li>Mapped zones default mein untrust hain; internal wale aap trusted mein move karte ho.</li>
<li>Clientless VPN trust se map hota hai aur badla nahi ja sakta.</li>
<li>Reserved names: trust, untrust, inter-fw aur remote network names.</li>
<li>Rules se pehle zones map karo aur push karo; log ke destination zone se verify karo.</li>
</ul></div>
`}};export{e as default};