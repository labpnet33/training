var e={id:`what`,h:{en:`What a data center is, and why it exists`,hi:`Data center kya hai, aur kyun banta hai`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to walk into a data center and name every layer you see: the building and power, the racks, the servers and hypervisors, the storage, and the network that joins them. You need no prior data center experience. If you know what an IP address and a switch are, you are ready. Everything else in the CCNP Data Center track (spine-leaf, VXLAN, EVPN, vPC, ACI, SAN, UCS, automation) builds on the picture you form here.</p>

<h3>Start with an analogy: a data center is a hotel for computers</h3>
<p>Think of a big hotel. Guests (applications) check in and need a room (a server or virtual machine), electricity, air-conditioning, security at the door, a corridor system so they can reach the restaurant and each other (the network), and a luggage room where they keep their bags safely (storage). The hotel management does not care which guest arrives. It cares that every room is powered, cooled, reachable and safe, 24 hours a day.</p>
<p>A <b>data center</b> is exactly that for computers: a building, or a room inside a building, designed to host many servers and give them <b>power, cooling, physical security, network connectivity and storage</b>, with enough redundancy that one failure does not stop the business.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Layers of a data center">
<rect x="10" y="10" width="620" height="40" rx="8" fill="#fde68a"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">Applications: banking app, email, website, ERP</text>
<rect x="10" y="58" width="620" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="83" text-anchor="middle" class="svg-ink" font-size="14">Compute: servers, hypervisors, virtual machines, containers</text>
<rect x="10" y="106" width="300" height="40" rx="8" fill="#bae6fd"/><text x="160" y="131" text-anchor="middle" class="svg-ink" font-size="14">Network: leaf and spine switches</text>
<rect x="330" y="106" width="300" height="40" rx="8" fill="#bbf7d0"/><text x="480" y="131" text-anchor="middle" class="svg-ink" font-size="14">Storage: SAN, NAS, object</text>
<rect x="10" y="154" width="620" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="179" text-anchor="middle" class="svg-ink" font-size="14">Racks, cabling, patch panels</text>
<rect x="10" y="202" width="620" height="40" rx="8" fill="#fed7aa"/><text x="320" y="227" text-anchor="middle" class="svg-ink" font-size="14">Facility: power (UPS, generator), cooling, fire safety, security</text>
</svg><p class="cap">Every layer depends on the one below it. A network engineer works in the middle, but must understand all six.</p></div>

<h3>Why companies build data centers at all</h3>
<p>Early businesses kept a few servers under a desk or in a cupboard. That breaks down quickly: the room overheats, a single power cut stops sales, anybody can walk in and unplug a server, and there is nowhere to add the fiftieth machine. Putting servers in one engineered place gives four big wins:</p>
<ul>
<li><b>Availability.</b> Dual power feeds, backup generators and redundant network paths mean the applications stay up when a component fails.</li>
<li><b>Scale.</b> Racks, power and cooling are planned so that you can add hundreds of servers without redesigning everything.</li>
<li><b>Security.</b> Badges, cameras, cages and locked racks protect the hardware; firewalls and segmentation protect the data.</li>
<li><b>Efficiency.</b> Sharing cooling, power and staff across thousands of servers is far cheaper than spreading them across offices.</li>
</ul>

<h3>Types of data center you will hear about</h3>
<table class="cmp"><tr><th>Type</th><th>Who owns what</th><th>Typical example</th></tr>
<tr><td><b>Enterprise (on-premises)</b></td><td>The company owns the building or room and everything inside</td><td>A bank's own DC in its head office campus</td></tr>
<tr><td><b>Colocation (colo)</b></td><td>A provider owns the building, power and cooling; you rent racks or cages and bring your own servers and switches</td><td>A startup renting two racks in a colo facility</td></tr>
<tr><td><b>Cloud / hyperscale</b></td><td>The provider owns everything; you rent virtual machines and services by the hour</td><td>Public cloud regions with hundreds of thousands of servers</td></tr>
<tr><td><b>Edge</b></td><td>Small sites close to users for low latency</td><td>A mini DC at a telecom tower or a factory</td></tr>
</table>
<p>Most real companies are <b>hybrid</b>: some workloads in their own DC or a colo, some in the public cloud, connected together. The skills in this track apply to all of them, because cloud providers run the same spine-leaf, VXLAN and EVPN designs inside their own buildings.</p>

<h3>North-south and east-west: the two directions of traffic</h3>
<p>Draw the data center with the internet at the top. Traffic that enters or leaves the building (a customer opening your website) travels up and down the drawing, so it is called <b>north-south</b>. Traffic that stays inside, between servers (the web server asking the application server, which asks the database), moves sideways and is called <b>east-west</b>.</p>
<p>Modern applications are split into many small services, so a single click from a user can cause dozens of east-west conversations. Today east-west traffic is usually far larger than north-south traffic. This one fact is the reason data center networks moved from the old three-tier design to <b>spine-leaf</b>, which you will study in the network modules.</p>

<div class="eg"><p><b>Worked example.</b> A customer opens an online shop's product page. One request comes in north-south. Behind it, the web server calls the product service, the price service, the stock service and the recommendation service. Each of those reads from a database and a cache. That single page view produced one north-south flow and about 12 east-west flows.</p></div>

<h3>Availability in numbers: the "nines"</h3>
<p>Data centers are measured by how much of the year they stay up. <b>99.9%</b> ("three nines") allows about 8.8 hours of downtime per year. <b>99.99%</b> ("four nines") allows about 53 minutes. <b>99.999%</b> ("five nines") allows about 5 minutes. Each extra nine costs much more money, because every single point of failure must be removed: two power feeds, two switches, two links, two storage paths.</p>
<p>You will see this <b>"always two"</b> rule everywhere in this track: two spines, two uplinks per leaf, vPC pairs, SAN fabric A and fabric B, two fabric interconnects in UCS.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Assuming that two of everything means you are redundant. If both power supplies of a switch plug into the same power strip, or both uplinks run through the same cable tray that a technician cuts, you still have one point of failure. Redundancy must be independent all the way down.</p></div>

<div class="scn"><h4>The Friday-evening outage</h4><p>A retail company ran its online store from a server room with a single UPS. On a Friday evening sale, the UPS battery failed during a short grid dip. Every server rebooted at once, the database came back corrupted, and the shop was offline for six hours at peak time. After the incident they moved into a colocation data center with two independent power feeds (A and B), dual power supplies in every server and switch, and each supply plugged into a different feed. Six months later a feed-A breaker tripped during maintenance. Nobody noticed except the monitoring system, because every device kept running on feed B.</p><p><b>Lesson:</b> a data center is not a room full of servers. It is a set of layers, each designed so that one failure is survivable.</p></div>

<div class="iv"><p class="q">"What is the difference between north-south and east-west traffic, and why does it matter for design?"</p><p>Strong answer: north-south enters or leaves the data center (clients to servers); east-west stays inside (server to server). Microservices and virtualisation made east-west dominant, and three-tier designs with spanning tree waste bandwidth and add hops for that traffic. That is why modern DCs use spine-leaf with routed, ECMP links, so any server reaches any other in the same number of hops. Give a real example, like one web request fanning out to many internal services.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A data center hosts servers and gives them power, cooling, security, network and storage, with redundancy.</li>
<li>Types: enterprise, colocation, cloud/hyperscale and edge; most companies are hybrid.</li>
<li>North-south = in and out of the DC; east-west = server to server. East-west now dominates.</li>
<li>Availability is counted in nines; every extra nine means removing more single points of failure.</li>
<li>"Always two, and truly independent" is the design habit behind everything in this track.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap kisi bhi data center mein jaa kar har layer ka naam le paoge: building aur power, racks, servers aur hypervisors, storage, aur network jo sabko jodta hai. Pehle se data center ka koi experience nahi chahiye. Agar aapko pata hai ki IP address aur switch kya hota hai, to aap ready ho. CCNP Data Center track ka baaki sab kuch (spine-leaf, VXLAN, EVPN, vPC, ACI, SAN, UCS, automation) isi picture par bana hai jo aap yahan banaoge.</p>

<h3>Ek analogy se shuru karo: data center computers ka hotel hai</h3>
<p>Ek bade hotel ke baare mein socho. Guests (applications) check in karte hain aur unhe ek room (server ya virtual machine), bijli, AC, gate par security, corridors taaki woh restaurant aur ek dusre tak pahunch sakein (network), aur ek luggage room jahan woh apna saaman safe rakhein (storage) chahiye. Hotel management ko farak nahi padta ki kaunsa guest aaya. Use farak padta hai ki har room mein bijli ho, thanda ho, pahunch mein ho aur safe ho, 24 ghante.</p>
<p><b>Data center</b> computers ke liye bilkul yahi hai: ek building, ya building ke andar ek room, jo bahut saare servers ko host karne ke liye design kiya gaya hai aur unhe <b>power, cooling, physical security, network connectivity aur storage</b> deta hai, itni redundancy ke saath ki ek failure se business na ruke.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Data center ki layers">
<rect x="10" y="10" width="620" height="40" rx="8" fill="#fde68a"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">Applications: banking app, email, website, ERP</text>
<rect x="10" y="58" width="620" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="83" text-anchor="middle" class="svg-ink" font-size="14">Compute: servers, hypervisors, virtual machines, containers</text>
<rect x="10" y="106" width="300" height="40" rx="8" fill="#bae6fd"/><text x="160" y="131" text-anchor="middle" class="svg-ink" font-size="14">Network: leaf aur spine switches</text>
<rect x="330" y="106" width="300" height="40" rx="8" fill="#bbf7d0"/><text x="480" y="131" text-anchor="middle" class="svg-ink" font-size="14">Storage: SAN, NAS, object</text>
<rect x="10" y="154" width="620" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="179" text-anchor="middle" class="svg-ink" font-size="14">Racks, cabling, patch panels</text>
<rect x="10" y="202" width="620" height="40" rx="8" fill="#fed7aa"/><text x="320" y="227" text-anchor="middle" class="svg-ink" font-size="14">Facility: power (UPS, generator), cooling, fire safety, security</text>
</svg><p class="cap">Har layer apne neeche wali layer par depend karti hai. Network engineer beech mein kaam karta hai, lekin use chhe ki chhe layers samajhni chahiye.</p></div>

<h3>Companies data center banati hi kyun hain</h3>
<p>Pehle businesses kuch servers desk ke neeche ya almari mein rakhte the. Yeh jaldi fail hota hai: room garam ho jata hai, ek power cut se sales ruk jaati hai, koi bhi andar aa kar server unplug kar sakta hai, aur pachaasvi machine lagane ki jagah nahi hoti. Servers ko ek engineered jagah par rakhne se chaar bade fayde milte hain:</p>
<ul>
<li><b>Availability.</b> Dual power feeds, backup generators aur redundant network paths ka matlab hai ki component fail hone par bhi applications chalti rehti hain.</li>
<li><b>Scale.</b> Racks, power aur cooling aise plan hote hain ki aap sab kuch redesign kiye bina sainkdon servers jod sako.</li>
<li><b>Security.</b> Badges, cameras, cages aur locked racks hardware ko bachate hain; firewalls aur segmentation data ko bachate hain.</li>
<li><b>Efficiency.</b> Hazaaron servers ke beech cooling, power aur staff share karna unhe alag alag offices mein failane se kahin sasta hai.</li>
</ul>

<h3>Data centers ke types jo aap sunoge</h3>
<table class="cmp"><tr><th>Type</th><th>Kiska kya hai</th><th>Typical example</th></tr>
<tr><td><b>Enterprise (on-premises)</b></td><td>Company building ya room aur andar ki har cheez ki maalik hai</td><td>Bank ka apna DC uske head office campus mein</td></tr>
<tr><td><b>Colocation (colo)</b></td><td>Provider building, power aur cooling ka maalik hai; aap racks ya cages kiraye par lete ho aur apne servers aur switches laate ho</td><td>Ek startup jo colo facility mein do racks kiraye par leta hai</td></tr>
<tr><td><b>Cloud / hyperscale</b></td><td>Provider sab kuch ka maalik hai; aap virtual machines aur services ghante ke hisaab se kiraye par lete ho</td><td>Public cloud regions jinmein laakhon servers hote hain</td></tr>
<tr><td><b>Edge</b></td><td>Users ke paas chhoti sites, kam latency ke liye</td><td>Telecom tower ya factory par mini DC</td></tr>
</table>
<p>Zyada tar real companies <b>hybrid</b> hoti hain: kuch workloads apne DC ya colo mein, kuch public cloud mein, aapas mein jude hue. Is track ki skills sab par apply hoti hain, kyunki cloud providers bhi apni buildings ke andar wahi spine-leaf, VXLAN aur EVPN designs chalate hain.</p>

<h3>North-south aur east-west: traffic ki do dishayen</h3>
<p>Data center ko draw karo aur internet ko upar rakho. Jo traffic building mein aata ya bahar jaata hai (customer aapki website kholta hai) woh drawing mein upar-neeche chalta hai, isliye use <b>north-south</b> kehte hain. Jo traffic andar hi rehta hai, servers ke beech (web server application server se poochta hai, jo database se poochta hai), woh side mein chalta hai aur use <b>east-west</b> kehte hain.</p>
<p>Modern applications bahut saari chhoti services mein bati hoti hain, isliye user ka ek click darjanon east-west baatcheet paida kar sakta hai. Aaj east-west traffic aam taur par north-south se kahin zyada hota hai. Yahi ek fact wajah hai ki data center networks purane three-tier design se <b>spine-leaf</b> par shift hue, jo aap network modules mein padhoge.</p>

<div class="eg"><p><b>Worked example.</b> Ek customer online shop ka product page kholta hai. Ek request north-south andar aati hai. Uske peeche web server product service, price service, stock service aur recommendation service ko call karta hai. Unmein se har ek database aur cache se padhta hai. Us ek page view ne ek north-south flow aur lagbhag 12 east-west flows banaye.</p></div>

<h3>Availability numbers mein: "nines"</h3>
<p>Data centers ko is baat se naapa jaata hai ki saal ka kitna hissa woh up rehte hain. <b>99.9%</b> ("three nines") saal mein lagbhag 8.8 ghante downtime allow karta hai. <b>99.99%</b> ("four nines") lagbhag 53 minute. <b>99.999%</b> ("five nines") lagbhag 5 minute. Har extra nine bahut zyada paisa leta hai, kyunki har single point of failure hatana padta hai: do power feeds, do switches, do links, do storage paths.</p>
<p>Yeh <b>"hamesha do"</b> rule aapko is track mein har jagah dikhega: do spines, har leaf ke do uplinks, vPC pairs, SAN fabric A aur fabric B, UCS mein do fabric interconnects.</p>

<div class="warn"><p><b>Beginners ki common galti.</b> Yeh maan lena ki har cheez do hai to redundancy ho gayi. Agar switch ke dono power supplies ek hi power strip mein lage hain, ya dono uplinks ek hi cable tray se jaate hain jise technician kaat de, to aapke paas abhi bhi ek point of failure hai. Redundancy neeche tak poori tarah independent honi chahiye.</p></div>

<div class="scn"><h4>Friday shaam ka outage</h4><p>Ek retail company apna online store ek UPS wale server room se chalati thi. Friday shaam ke sale mein, grid ke chhote dip ke dauraan UPS battery fail ho gayi. Saare servers ek saath reboot hue, database corrupt ho kar wapas aaya, aur shop peak time par chhe ghante offline rahi. Incident ke baad woh ek colocation data center mein shift hue jahan do independent power feeds (A aur B) the, har server aur switch mein dual power supplies thi, aur har supply alag feed mein lagi thi. Chhe mahine baad maintenance ke dauraan feed-A ka breaker trip hua. Monitoring system ke alawa kisi ko pata bhi nahi chala, kyunki har device feed B par chalta raha.</p><p><b>Seekh:</b> data center servers se bhara room nahi hai. Yeh layers ka set hai, jismein har layer aise design ki gayi hai ki ek failure jhela ja sake.</p></div>

<div class="iv"><p class="q">"North-south aur east-west traffic mein kya farak hai, aur design ke liye yeh kyun matter karta hai?"</p><p>Strong answer: north-south data center mein aata ya bahar jaata hai (clients se servers); east-west andar rehta hai (server se server). Microservices aur virtualisation ne east-west ko dominant bana diya, aur spanning tree wale three-tier designs us traffic ke liye bandwidth waste karte hain aur hops badhate hain. Isiliye modern DCs routed, ECMP links wala spine-leaf use karte hain, taaki koi bhi server kisi bhi server tak same number of hops mein pahunche. Real example do, jaise ek web request ka bahut saari internal services tak fail jaana.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Data center servers ko host karta hai aur unhe power, cooling, security, network aur storage deta hai, redundancy ke saath.</li>
<li>Types: enterprise, colocation, cloud/hyperscale aur edge; zyada tar companies hybrid hain.</li>
<li>North-south = DC ke andar aur bahar; east-west = server se server. Ab east-west dominate karta hai.</li>
<li>Availability nines mein ginte hain; har extra nine ka matlab hai aur single points of failure hatana.</li>
<li>"Hamesha do, aur sach mein independent" hi is track ki har cheez ke peeche ki design habit hai.</li>
</ul></div>
`}};export{e as default};