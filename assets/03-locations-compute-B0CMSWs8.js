var e={id:`locations-compute`,h:{en:`Locations, compute locations and termination nodes`,hi:`Locations, compute locations aur termination nodes`},body:{en:`
<p>Prisma Access is a global service, so the first design question is always "where?". Two words are used for places and they are easy to mix up: <b>location</b> and <b>compute location</b>. The exam tests this difference, and bandwidth planning depends on it.</p>

<h3>Analogy: bank branches and regional offices</h3>
<p>A bank has many local branches where customers walk in. Several nearby branches report to one regional office that holds the shared budget and staff. A Prisma Access <b>location</b> is the branch where users and sites attach. A <b>compute location</b> is the regional office: it groups at least two nearby locations and is the unit for which bandwidth is allocated.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Compute location groups locations">
<rect x="150" y="20" width="340" height="120" rx="10" fill="#ddd6fe"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Compute location: Asia South (Mumbai)</text>
<rect x="180" y="62" width="130" height="50" rx="6" fill="#bae6fd"/><text x="245" y="84" text-anchor="middle" class="svg-ink" font-size="12">Location</text><text x="245" y="100" text-anchor="middle" class="svg-muted" font-size="11">India West</text>
<rect x="330" y="62" width="130" height="50" rx="6" fill="#bae6fd"/><text x="395" y="84" text-anchor="middle" class="svg-ink" font-size="12">Location</text><text x="395" y="100" text-anchor="middle" class="svg-muted" font-size="11">India South</text>
<rect x="30" y="165" width="150" height="40" rx="6" fill="#bbf7d0"/><text x="105" y="189" text-anchor="middle" class="svg-ink" font-size="12">Bandwidth is set here</text>
<line x1="180" y1="150" x2="230" y2="140" stroke="#64748b"/>
<text x="470" y="189" text-anchor="middle" class="svg-muted" font-size="12">Users and sites attach to locations</text>
</svg><p class="cap">A compute location groups at least two nearby locations. Example taken from the documented locations table.</p></div>

<h3>Locations</h3>
<p>A location is a place where users and sites connect: a city or region such as India West or India South. When you create a remote network, you choose a location (usually the closest one to the branch). When mobile users connect, the GlobalProtect app selects a location for them; you control which locations are enabled. Choosing a nearby location reduces delay.</p>

<h3>Compute locations</h3>
<p>The documentation groups at least two nearby locations into a <b>compute location</b>. In the documented table, the compute location "Asia South" is in Mumbai and holds India West and India South, while "India North" is New Delhi. Bandwidth for remote networks is allocated per compute location, so a branch in India West and a branch in India South share the same bandwidth pool. You see compute locations in the bandwidth screens and in the Prisma Access Locations list.</p>
<table class="cmp"><tr><th>Term</th><th>Meaning</th><th>Used for</th></tr>
<tr><td>Location</td><td>Where users or a site attach</td><td>Choosing a remote network or enabling mobile-user locations</td></tr>
<tr><td>Compute location</td><td>Group of at least two nearby locations</td><td>Allocating bandwidth</td></tr>
<tr><td>IPSec termination node</td><td>The cloud device that ends a site tunnel</td><td>Capacity of a remote network, up to 1,000 Mbps per node</td></tr>
<tr><td>Service endpoint address</td><td>FQDN or IP of a node</td><td>The peer address you type on the branch firewall</td></tr>
</table>

<h3>Termination nodes and service endpoint addresses</h3>
<p>A remote network is bound to an <b>IPSec termination node</b> inside its compute location. Each node has a <b>Service Endpoint Address</b>, an FQDN or an IP address. This is the address you configure as the <b>peer IP</b> on your branch firewall. A node supports up to 1,000 Mbps, so large sites in one compute location may use several nodes. In the lab, the documentation addresses stand in for these real endpoints: 203.0.113.101 for the remote network and 203.0.113.102 for the service connection.</p>
<pre class="out">Network Details &gt; Remote Networks (lab console view)
Site        Location    Service Endpoint Address   Local IP
BR-Delhi    India West  <span class="hl">203.0.113.101</span>          10.254.1.1
</pre>
<p>The line to read is the Service Endpoint Address. If the branch firewall peers with any other address, the IKE negotiation never starts.</p>

<div class="eg"><p><b>Worked example.</b> A company has branches in Pune, Mumbai and Chennai, all closest to locations inside the Asia South compute location, and a branch in Delhi in India North. It licenses 400 Mbps in total. The engineer allocates 250 Mbps to Asia South for the three southern branches and 100 Mbps to India North for Delhi, leaving 50 Mbps in reserve. Each compute location must get at least 50 Mbps, so the minimum is respected. If the three southern branches later grow, the engineer raises the Asia South figure, not the individual locations.</p></div>

<div class="warn"><p><b>Common mistake.</b> Enabling mobile user locations in only one compute location. If that compute location has a problem, users have nowhere nearby to go. The documentation advises enabling locations in more than one compute location.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Bandwidth is allocated per location" is wrong for the aggregate bandwidth model. It is allocated per compute location, and Prisma Access divides it among the sites there. Also remember the minimum of 50 Mbps per compute location.</p></div>

<div class="scn"><h4>The branch peered with the wrong address</h4><p>A new branch firewall showed no IKE security association. The engineer had copied the address of another branch's node from an old document. In the Network Details screen the correct Service Endpoint Address for the new site was different. After changing the peer IP on the firewall, the tunnel came up in under a minute.</p><p><b>Lesson:</b> always take the peer address from the console for that specific remote network, never from a previous project.</p></div>

<div class="iv"><p class="q">"What is the difference between a Prisma Access location and a compute location?"</p><p>Strong answer: a location is where a user or site attaches, such as India West. A compute location groups at least two nearby locations, and bandwidth is allocated per compute location. A remote network also binds to an IPSec termination node with a service endpoint address, which is the peer IP on the branch device.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Location = where users or sites attach; compute location = group of at least two nearby locations.</li>
<li>Bandwidth is allocated per compute location, with a minimum of 50 Mbps each.</li>
<li>A termination node gives up to 1,000 Mbps and has a Service Endpoint Address.</li>
<li>The branch peer IP must be the Service Endpoint Address from the console.</li>
<li>Enable mobile user locations in more than one compute location.</li>
</ul></div>
`,hi:`
<p>Prisma Access ek global service hai, isliye pehla design sawaal hamesha "kahan?" hota hai. Jagah ke liye do shabd use hote hain jo aasani se mix ho jaate hain: <b>location</b> aur <b>compute location</b>. Exam yeh farak test karta hai, aur bandwidth planning isi par depend karti hai.</p>

<h3>Analogy: bank branches aur regional offices</h3>
<p>Ek bank ki kai local branches hoti hain jahan customers aate hain. Kuch paas ki branches ek regional office ko report karti hain jo shared budget aur staff rakhta hai. Prisma Access ka <b>location</b> woh branch hai jahan users aur sites attach hote hain. <b>Compute location</b> regional office hai: yeh kam se kam do paas ke locations ko group karta hai aur isi unit par bandwidth allocate hoti hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Compute location locations ko group karta hai">
<rect x="150" y="20" width="340" height="120" rx="10" fill="#ddd6fe"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Compute location: Asia South (Mumbai)</text>
<rect x="180" y="62" width="130" height="50" rx="6" fill="#bae6fd"/><text x="245" y="84" text-anchor="middle" class="svg-ink" font-size="12">Location</text><text x="245" y="100" text-anchor="middle" class="svg-muted" font-size="11">India West</text>
<rect x="330" y="62" width="130" height="50" rx="6" fill="#bae6fd"/><text x="395" y="84" text-anchor="middle" class="svg-ink" font-size="12">Location</text><text x="395" y="100" text-anchor="middle" class="svg-muted" font-size="11">India South</text>
<rect x="30" y="165" width="150" height="40" rx="6" fill="#bbf7d0"/><text x="105" y="189" text-anchor="middle" class="svg-ink" font-size="12">Bandwidth yahan set hoti hai</text>
<line x1="180" y1="150" x2="230" y2="140" stroke="#64748b"/>
<text x="470" y="189" text-anchor="middle" class="svg-muted" font-size="12">Users aur sites locations se attach hote hain</text>
</svg><p class="cap">Compute location kam se kam do paas ke locations ko group karta hai. Example documented locations table se liya gaya hai.</p></div>

<h3>Locations</h3>
<p>Location woh jagah hai jahan users aur sites connect hote hain: India West ya India South jaisa shehar ya region. Remote network banate waqt aap ek location choose karte ho (aam taur par branch ke sabse paas wala). Mobile users connect karte hain to GlobalProtect app unke liye ek location select karti hai; kaun se locations enabled hain yeh aap control karte ho. Paas ka location chunne se delay kam hota hai.</p>

<h3>Compute locations</h3>
<p>Documentation kam se kam do paas ke locations ko ek <b>compute location</b> mein group karti hai. Documented table mein compute location "Asia South" Mumbai mein hai aur India West aur India South ko hold karta hai, jabki "India North" New Delhi hai. Remote networks ki bandwidth compute location ke hisaab se allocate hoti hai, isliye India West aur India South ki branches ek hi bandwidth pool share karti hain. Compute locations aap bandwidth screens aur Prisma Access Locations list mein dekhte ho.</p>
<table class="cmp"><tr><th>Term</th><th>Matlab</th><th>Kis kaam ke liye</th></tr>
<tr><td>Location</td><td>Jahan users ya site attach hoti hai</td><td>Remote network chunna ya mobile-user locations enable karna</td></tr>
<tr><td>Compute location</td><td>Kam se kam do paas ke locations ka group</td><td>Bandwidth allocate karna</td></tr>
<tr><td>IPSec termination node</td><td>Cloud device jo site tunnel end karta hai</td><td>Remote network ki capacity, per node 1,000 Mbps tak</td></tr>
<tr><td>Service endpoint address</td><td>Node ka FQDN ya IP</td><td>Branch firewall par jo peer address type karte ho</td></tr>
</table>

<h3>Termination nodes aur service endpoint addresses</h3>
<p>Remote network apne compute location ke andar ek <b>IPSec termination node</b> se bandha hota hai. Har node ka ek <b>Service Endpoint Address</b> hota hai, FQDN ya IP address. Yahi address aapke branch firewall par <b>peer IP</b> ke roop mein configure hota hai. Ek node 1,000 Mbps tak support karta hai, isliye ek compute location ki badi sites kai nodes use kar sakti hain. Lab mein documentation addresses in real endpoints ki jagah hain: remote network ke liye 203.0.113.101 aur service connection ke liye 203.0.113.102.</p>
<pre class="out">Network Details &gt; Remote Networks (lab console view)
Site        Location    Service Endpoint Address   Local IP
BR-Delhi    India West  <span class="hl">203.0.113.101</span>          10.254.1.1
</pre>
<p>Dekhne wali line Service Endpoint Address hai. Agar branch firewall kisi aur address se peer karta hai to IKE negotiation shuru hi nahi hota.</p>

<div class="eg"><p><b>Worked example.</b> Ek company ki Pune, Mumbai aur Chennai mein branches hain, teeno Asia South compute location ke andar ke locations ke sabse paas hain, aur Delhi ki branch India North mein hai. Total 400 Mbps licensed hai. Engineer teen southern branches ke liye Asia South ko 250 Mbps, Delhi ke liye India North ko 100 Mbps deta hai, aur 50 Mbps reserve rakhta hai. Har compute location ko kam se kam 50 Mbps milna chahiye, isliye minimum follow hota hai. Agar southern branches baad mein badhein, engineer Asia South ka figure badhata hai, individual locations ka nahi.</p></div>

<div class="warn"><p><b>Common galti.</b> Mobile user locations sirf ek compute location mein enable karna. Agar us compute location mein problem aaye to users ke paas paas mein jaane ki jagah nahi bachti. Documentation kai compute locations mein locations enable karne ki salah deti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Bandwidth per location allocate hoti hai" aggregate bandwidth model ke liye galat hai. Yeh compute location ke hisaab se allocate hoti hai, aur Prisma Access use wahan ki sites mein baant deta hai. Compute location ka minimum 50 Mbps bhi yaad rakho.</p></div>

<div class="scn"><h4>Branch ne galat address se peer kiya</h4><p>Naye branch firewall par koi IKE security association nahi dikh raha tha. Engineer ne purane document se kisi aur branch ke node ka address copy kar liya tha. Network Details screen mein naye site ka sahi Service Endpoint Address alag tha. Firewall par peer IP badalte hi tunnel ek minute se kam mein up ho gaya.</p><p><b>Seekh:</b> peer address hamesha us specific remote network ke console se lo, pichhle project se kabhi nahi.</p></div>

<div class="iv"><p class="q">"Prisma Access location aur compute location mein kya farak hai?"</p><p>Strong answer: location woh hai jahan user ya site attach hoti hai, jaise India West. Compute location kam se kam do paas ke locations ko group karta hai, aur bandwidth compute location ke hisaab se allocate hoti hai. Remote network ek IPSec termination node se bhi bandha hota hai jiska service endpoint address branch device par peer IP hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Location = jahan users ya sites attach hote hain; compute location = kam se kam do paas ke locations ka group.</li>
<li>Bandwidth compute location ke hisaab se allocate hoti hai, minimum 50 Mbps each.</li>
<li>Termination node 1,000 Mbps tak deta hai aur uska ek Service Endpoint Address hota hai.</li>
<li>Branch peer IP console wala Service Endpoint Address hona chahiye.</li>
<li>Mobile user locations kai compute locations mein enable karo.</li>
</ul></div>
`}};export{e as default};