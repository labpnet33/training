var e={id:`source-nat-mobile-users`,h:{en:`Source NAT for mobile users on a service connection`,hi:`Service connection par mobile users ke liye Source NAT`},body:{en:`
<p>Imagine your warehouse guard has a visitor list. Instead of listing hundreds of travelling salespeople one by one, the courier says: "all our drivers will arrive wearing the same badge, number range 10.254.8.x". The guard now only needs to know one small range. That is Source NAT for mobile users: instead of HQ seeing the whole mobile pool, it sees a small NAT pool.</p>

<h3>The problem it solves</h3>
<p>Mobile users get addresses from a pool (lab: 10.200.0.0/23, at least a /23). Normally HQ needs a return route to that whole pool. That is sometimes hard: the HQ network team may not want to add large, changing prefixes, or the HQ may already use overlapping ranges. Source NAT lets Prisma Access translate mobile-user traffic to a small, HQ-friendly pool before it enters the service connection.</p>

<h3>Where you enable it</h3>
<table class="cmp"><tr><th>Item</th><th>SCM</th><th>Panorama</th></tr>
<tr><td>Switch</td><td>Source NAT (Mobile Users) on the service connection</td><td>Miscellaneous tab: Enable Data Traffic source NAT / Infrastructure Traffic source NAT</td></tr>
<tr><td>Choices</td><td>Data Traffic and/or Infrastructure Traffic</td><td>Two check boxes plus User-ID</td></tr>
<tr><td>Pool</td><td>A /25 to /32 pool</td><td>IP Pool, RFC 1918, /25 to /32</td></tr>
</table>

<h3>Data traffic and infrastructure traffic</h3>
<p>The docs give two options. <b>Data traffic</b> is the traffic of your mobile users toward the corporate network. <b>Infrastructure traffic</b> is traffic that Prisma Access itself generates toward corporate servers for services such as authentication. You can translate either or both. Check the in-console help for your release for the exact list of traffic types covered.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Source NAT before and after">
<rect x="20" y="20" width="290" height="160" rx="10" fill="#e2e8f0"/><text x="165" y="44" text-anchor="middle" class="svg-ink" font-size="14">Without Source NAT</text>
<text x="165" y="80" text-anchor="middle" class="svg-muted" font-size="12">HQ sees 10.200.0.x</text><text x="165" y="104" text-anchor="middle" class="svg-muted" font-size="12">HQ needs route to</text><text x="165" y="124" text-anchor="middle" class="svg-accent" font-size="13">10.200.0.0/23</text><text x="165" y="150" text-anchor="middle" class="svg-muted" font-size="12">(whole mobile pool)</text>
<rect x="330" y="20" width="290" height="160" rx="10" fill="#bbf7d0"/><text x="475" y="44" text-anchor="middle" class="svg-ink" font-size="14">With Source NAT</text>
<text x="475" y="80" text-anchor="middle" class="svg-muted" font-size="12">HQ sees NAT pool</text><text x="475" y="104" text-anchor="middle" class="svg-muted" font-size="12">HQ needs route to</text><text x="475" y="124" text-anchor="middle" class="svg-accent" font-size="13">10.254.8.0/28 (example)</text><text x="475" y="150" text-anchor="middle" class="svg-muted" font-size="12">(small pool only)</text>
</svg><p class="cap">Source NAT shrinks what HQ must route back to the cloud.</p></div>

<h3>What changes for routing</h3>
<p>With Source NAT enabled, mobile-user traffic leaves the service connection using addresses from the NAT pool. So HQ's return route must cover the NAT pool. The docs note that only the specified subnets are advertised. Plan the pool so that it does not overlap any HQ network, the infrastructure subnet 10.255.0.0/24 or the mobile pool.</p>
<p>In our base lab Source NAT is <b>not</b> used (pool: none), so HQ must have a route back to 10.200.0.0/23. We study that return route in chapter 6.</p>

<h3>Side effects</h3>
<ul>
<li>HQ logs and policies see NAT addresses, not individual user addresses. If HQ needs per-user control, rely on User-ID in Prisma Access instead (the Panorama check box is there for this purpose).</li>
<li>A small pool can run out of ports with many users. Size it, and watch for exhaustion.</li>
<li>Source NAT affects mobile-user traffic. It is not a general fix for branch routing problems.</li>
</ul>

<div class="eg"><p><b>Worked example (course choice).</b> The HQ firewall team refuses to add 10.200.0.0/23 to its routing table because the same range is used in an acquired subsidiary. The admin enables Data Traffic source NAT with pool 10.254.8.0/28. Mobile users reach 10.10.0.50 appearing as 10.254.8.x. HQ adds one route to 10.254.8.0/28 via the tunnel, and the conflict is gone.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Choosing a pool larger than /25 or smaller than /32; using a public pool (the setting expects RFC 1918); forgetting the HQ return route to the NAT pool; assuming NAT also fixes branch traffic.</p></div>
<div class="exam"><p><b>Exam trap.</b> The pool must be between /25 and /32 and RFC 1918. Source NAT is configured on the service connection and applies to mobile users. Remember the Data Traffic and Infrastructure Traffic options.</p></div>

<div class="scn"><h4>Return route to a smaller pool</h4><p>A bank refused a large new prefix at its data centre firewall. The Prisma Access admin enabled Source NAT with a /28 pool. The bank added one route to the /28. Mobile users reached the app. The audit team also liked that all cloud users appeared as one known source range.</p><p><b>Lesson:</b> Source NAT turns a routing conversation into a one-line request.</p></div>

<div class="iv"><p class="q">"Why would you enable Source NAT on a service connection?"</p><p>To make mobile-user traffic appear from a small RFC 1918 pool (/25 to /32) so HQ needs only a route to that pool instead of the whole mobile range, or to avoid overlap with HQ addressing. The trade-off is that HQ sees NAT addresses instead of user pool addresses.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Source NAT hides the mobile pool behind a small pool.</li>
<li>Pool: RFC 1918, /25 to /32, no overlap with HQ, infrastructure or mobile pool.</li>
<li>Options: Data Traffic, Infrastructure Traffic, or both.</li>
<li>HQ return route must cover the NAT pool when it is used.</li>
<li>Base lab does not use Source NAT.</li>
</ul></div>
`,hi:`
<p>Socho aapke warehouse guard ke paas visitor list hai. Hundreds of travelling salespeople ko ek ek karke likhne ki jagah courier kehta hai: "hamare saare drivers ek hi badge pehnkar aayenge, number range 10.254.8.x". Guard ko ab sirf ek chhoti range pata honi chahiye. Mobile users ke liye Source NAT yahi hai: HQ ko poora mobile pool dikhne ki jagah ek chhota NAT pool dikhta hai.</p>

<h3>Yeh kaun si problem solve karta hai</h3>
<p>Mobile users ko pool se addresses milte hain (lab: 10.200.0.0/23, kam se kam /23). Aam taur par HQ ko us poore pool ka return route chahiye. Yeh kabhi mushkil hota hai: HQ network team bade, badalte prefixes add nahi karna chahti, ya HQ pehle se overlapping ranges use karta hai. Source NAT Prisma Access ko mobile-user traffic ko service connection mein jaane se pehle chhote, HQ-friendly pool mein translate karne deta hai.</p>

<h3>Kahan enable karte hain</h3>
<table class="cmp"><tr><th>Item</th><th>SCM</th><th>Panorama</th></tr>
<tr><td>Switch</td><td>Service connection par Source NAT (Mobile Users)</td><td>Miscellaneous tab: Enable Data Traffic source NAT / Infrastructure Traffic source NAT</td></tr>
<tr><td>Choices</td><td>Data Traffic aur/ya Infrastructure Traffic</td><td>Do check boxes aur User-ID</td></tr>
<tr><td>Pool</td><td>/25 se /32 pool</td><td>IP Pool, RFC 1918, /25 se /32</td></tr>
</table>

<h3>Data traffic aur infrastructure traffic</h3>
<p>Docs do options dete hain. <b>Data traffic</b> aapke mobile users ka corporate network ki taraf traffic hai. <b>Infrastructure traffic</b> woh traffic hai jo Prisma Access khud corporate servers ki taraf generate karta hai, jaise authentication jaisi services ke liye. Aap ek ya dono translate kar sakte ho. Apni release ke liye in-console help mein check karo ki exactly kaun se traffic types cover hote hain.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Source NAT before and after">
<rect x="20" y="20" width="290" height="160" rx="10" fill="#e2e8f0"/><text x="165" y="44" text-anchor="middle" class="svg-ink" font-size="14">Source NAT ke bina</text>
<text x="165" y="80" text-anchor="middle" class="svg-muted" font-size="12">HQ ko 10.200.0.x dikhta hai</text><text x="165" y="104" text-anchor="middle" class="svg-muted" font-size="12">HQ ko route chahiye</text><text x="165" y="124" text-anchor="middle" class="svg-accent" font-size="13">10.200.0.0/23</text><text x="165" y="150" text-anchor="middle" class="svg-muted" font-size="12">(poora mobile pool)</text>
<rect x="330" y="20" width="290" height="160" rx="10" fill="#bbf7d0"/><text x="475" y="44" text-anchor="middle" class="svg-ink" font-size="14">Source NAT ke saath</text>
<text x="475" y="80" text-anchor="middle" class="svg-muted" font-size="12">HQ ko NAT pool dikhta hai</text><text x="475" y="104" text-anchor="middle" class="svg-muted" font-size="12">HQ ko route chahiye</text><text x="475" y="124" text-anchor="middle" class="svg-accent" font-size="13">10.254.8.0/28 (example)</text><text x="475" y="150" text-anchor="middle" class="svg-muted" font-size="12">(sirf chhota pool)</text>
</svg><p class="cap">Source NAT HQ ke wapas cloud ke routes ko chhota kar deta hai.</p></div>

<h3>Routing mein kya badalta hai</h3>
<p>Source NAT enabled ho to mobile-user traffic NAT pool ke addresses se service connection se nikalta hai. Isliye HQ ka return route NAT pool ko cover kare. Docs ke hisaab se sirf specified subnets advertise hote hain. Pool aise plan karo ki woh kisi HQ network, infrastructure subnet 10.255.0.0/24 ya mobile pool se overlap na kare.</p>
<p>Hamari base lab mein Source NAT <b>use nahi hota</b> (pool: none), isliye HQ ke paas 10.200.0.0/23 ka return route hona chahiye. Woh return route hum chapter 6 mein padhte hain.</p>

<h3>Side effects</h3>
<ul>
<li>HQ logs aur policies NAT addresses dekhte hain, individual user pool addresses nahi. HQ ko per-user control chahiye to Prisma Access ke User-ID par rely karo (Panorama ka check box isi ke liye hai).</li>
<li>Chhota pool bahut users ke saath ports khatam kar sakta hai. Size karo, aur exhaustion par nazar rakho.</li>
<li>Source NAT mobile-user traffic ko affect karta hai. Yeh branch routing problems ka general fix nahi hai.</li>
</ul>

<div class="eg"><p><b>Worked example (course choice).</b> HQ firewall team 10.200.0.0/23 ko apni routing table mein add karne se mana karti hai kyunki wahi range ek acquired subsidiary mein use hoti hai. Admin pool 10.254.8.0/28 ke saath Data Traffic source NAT enable karta hai. Mobile users 10.254.8.x ke roop mein 10.10.0.50 tak pahunchte hain. HQ 10.254.8.0/28 ka tunnel ke through ek route add karta hai, aur conflict khatam.</p></div>

<div class="warn"><p><b>Common mistakes.</b> /25 se bada ya /32 se chhota pool chunna; public pool use karna (setting RFC 1918 expect karti hai); NAT pool ka HQ return route bhoolna; yeh maanna ki NAT branch traffic ko bhi fix karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Pool /25 se /32 ke beech aur RFC 1918 hona chahiye. Source NAT service connection par configure hota hai aur mobile users par lagu hota hai. Data Traffic aur Infrastructure Traffic options yaad rakho.</p></div>

<div class="scn"><h4>Chhote pool ka return route</h4><p>Ek bank ne apne data centre firewall par bada naya prefix add karne se mana kiya. Prisma Access admin ne /28 pool ke saath Source NAT enable kiya. Bank ne /28 ka ek route add kiya. Mobile users app tak pahunche. Audit team ko bhi pasand aaya ki saare cloud users ek jaani-pehchani source range se dikhte hain.</p><p><b>Lesson:</b> Source NAT routing ki lambi baat ko ek line ki request bana deta hai.</p></div>

<div class="iv"><p class="q">"Service connection par Source NAT kyun enable karoge?"</p><p>Taaki mobile-user traffic chhote RFC 1918 pool (/25 se /32) se aaye aur HQ ko poori mobile range ki jagah sirf us pool ka route chahiye ho, ya HQ addressing se overlap se bacha ja sake. Trade-off yeh hai ki HQ ko user pool addresses ki jagah NAT addresses dikhte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Source NAT mobile pool ko chhote pool ke peeche chhupata hai.</li>
<li>Pool: RFC 1918, /25 se /32, HQ, infrastructure ya mobile pool se overlap nahi.</li>
<li>Options: Data Traffic, Infrastructure Traffic, ya dono.</li>
<li>NAT use ho to HQ return route NAT pool ko cover kare.</li>
<li>Base lab Source NAT use nahi karti.</li>
</ul></div>
`}};export{e as default};