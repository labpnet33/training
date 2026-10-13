var e=`<svg viewBox="0 0 640 250" role="img" aria-label="Geography, region and zones">
<rect x="10" y="10" width="620" height="230" rx="10" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5 4"/><text x="24" y="30" class="svg-accent" font-size="13">Geography: India</text>
<rect x="30" y="45" width="280" height="180" rx="8" fill="#bae6fd"/><text x="44" y="65" class="svg-ink" font-size="13">Region: Central India (Pune)</text>
<rect x="44" y="80" width="76" height="60" rx="6" fill="#bbf7d0"/><text x="82" y="106" text-anchor="middle" class="svg-ink" font-size="12">Zone 1</text>
<rect x="132" y="80" width="76" height="60" rx="6" fill="#bbf7d0"/><text x="170" y="106" text-anchor="middle" class="svg-ink" font-size="12">Zone 2</text>
<rect x="220" y="80" width="76" height="60" rx="6" fill="#bbf7d0"/><text x="258" y="106" text-anchor="middle" class="svg-ink" font-size="12">Zone 3</text>
<text x="170" y="170" text-anchor="middle" class="svg-muted" font-size="12">VNet and subnets are regional</text><text x="170" y="190" text-anchor="middle" class="svg-muted" font-size="12">VMs choose a zone</text>
<rect x="350" y="45" width="260" height="180" rx="8" fill="#ddd6fe"/><text x="364" y="65" class="svg-ink" font-size="13">Region: South India (Chennai)</text>
<text x="480" y="120" text-anchor="middle" class="svg-muted" font-size="12">paired region (verify)</text><text x="480" y="140" text-anchor="middle" class="svg-muted" font-size="12">zone support differs (verify)</text>
<line x1="310" y1="135" x2="350" y2="135" stroke="#64748b" stroke-width="2"/>
</svg>`,t={id:`regions-zones`,h:{en:`Regions, availability zones and choosing Central India or South India`,hi:`Regions, availability zones aur Central India ya South India chunna`},body:{en:`
<h3>Where does my network physically live?</h3>
<p>A cloud network is not magic: it runs in real buildings full of servers. Azure groups them in a few levels. Understanding the levels tells you where your data sits, how far it is from your users, and how to survive a failure.</p>

<h3>Geography, region, availability zone</h3>
<dl class="terms">
<dt>Geography</dt><dd>A market area such as India, usually containing two or more regions, with data residency and compliance rules in mind.</dd>
<dt>Region</dt><dd>A set of datacentres joined by a low-latency network in one area. Resources are created in a chosen region, for example <code>centralindia</code>.</dd>
<dt>Availability zone</dt><dd>A physically separate location inside a region with independent power, cooling and networking. Regions that support zones have at least three.</dd>
<dt>Region pair</dt><dd>Two regions in the same geography that Microsoft treats as partners for some replication and recovery features. India pairs Central India with South India (verify before publishing, and verify which services use pairs).</dd>
</dl>

<div class="dia">`+e+`<p class="cap">One geography holds several regions. Zones are inside a region. Not every region has zones.</p></div>

<h3>The Indian regions</h3>
<table class="cmp"><tr><th>Region name</th><th>CLI name</th><th>Notes</th></tr>
<tr><td>Central India</td><td><code>centralindia</code></td><td>Pune. Good default for labs and many workloads. Supports availability zones (verify before publishing).</td></tr>
<tr><td>South India</td><td><code>southindia</code></td><td>Chennai. Often used as the pair for disaster recovery. Zone support and available VM sizes can differ (verify before publishing).</td></tr>
<tr><td>West India</td><td><code>westindia</code></td><td>Mumbai. Availability for new customers may be limited (verify before publishing).</td></tr>
</table>
<p>List what your subscription can actually use instead of trusting a table:</p>
<pre class="code">az account list-locations --query "[?contains(name,'india')].{name:name, display:displayName}" --output table</pre>
<p>Illustrative output:</p>
<pre class="out">Name          Display
------------  -------------
<span class="hl">centralindia</span>  Central India
southindia    South India
westindia     West India</pre>

<h3>How to choose a region</h3>
<ol>
<li><b>Latency.</b> Pick the region closest to your users. For learners in India, Central India or South India.</li>
<li><b>Data residency and compliance.</b> Some data must stay in India.</li>
<li><b>Service availability.</b> Not every service or VM size exists in every region. If a create fails with a capacity or "not available in this location" style message, try another region (verify exact error text).</li>
<li><b>Price.</b> Prices differ by region (verify on the Azure pricing pages).</li>
<li><b>Resilience.</b> For high availability choose a region with zones and spread resources across them; for disaster recovery, copy to another region.</li>
</ol>

<h3>Zones and networks: the Azure difference</h3>
<p>This is the point that surprises engineers who know AWS. In Azure, a <b>VNet and its subnets are regional</b>. A subnet is not tied to one zone. A virtual machine, a managed disk or a public IP is what you place in a zone, and a Standard public IP can be zone-redundant. So you build one subnet and put VMs from several zones in it.</p>
<div class="note"><p><b>AWS vs Azure.</b> AWS subnet = one AZ, so you create a subnet per AZ. Azure subnet = whole region, so you place resources in zones instead. Azure zone numbers (1, 2, 3) are logical and mapped per subscription, so zone 1 for you may not be the same building as zone 1 for another customer (verify before publishing).</p></div>

<div class="eg"><p><b>Worked example.</b> A learner in Hyderabad deploys a lab VNet and VM. Central India gives low latency and keeps the data in India, so she picks <code>centralindia</code>. Her VM size is unavailable there, so she tries a different size in the same region first, and only then <code>southindia</code>. Because VNets are regional, a VNet in Central India cannot hold a VM in South India. She would need a second VNet and peering, which is a later module.</p></div>

<div class="warn"><p><b>Common mistake.</b> Creating the VNet in one region and a VM or NIC in another and hunting for the dropdown. A NIC must be in the same region as its VNet, and a VM must be in the same region as the NIC.</p></div>

<div class="exam"><p><b>Exam trap.</b> AZ-900 tests the difference between a region, a region pair and an availability zone, and that zones protect against datacentre failure while region pairs help with regional disaster. Not all regions have zones. VNets span all zones of one region and never span regions.</p></div>

<div class="scn"><h4>Capacity in the wrong place</h4><p>A trainer's script created a VM in South India for a batch class, and half the students got an error that the chosen size was not available. He did not change the code. He checked the sizes offered in the region with the CLI, picked another size that existed, and the batch worked. A year later the script took the region and size as parameters.</p><p><b>Lesson:</b> region choice and size availability are part of the design, so make them parameters.</p></div>

<div class="iv"><p class="q">"What is the difference between an availability zone and a region pair?"</p><p>Zones are separate datacentre locations inside one region and protect against a single datacentre failure. A region pair is two regions in a geography used for disaster recovery and some replication. Mention that VNets are regional and that you select the zone on the VM, disk or public IP.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Geography contains regions; a region contains zones (if supported).</li>
<li>Indian regions: Central India (Pune), South India (Chennai), West India (Mumbai); verify availability.</li>
<li>VNets and subnets are regional; VMs, disks and Standard public IPs are zonal or zone-redundant.</li>
<li>Choose by latency, residency, service availability, price and resilience.</li>
<li>List regions with az account list-locations.</li>
</ul></div>
`,hi:`
<h3>Mera network physically kahan rehta hai?</h3>
<p>Cloud network jaadu nahi hai: yeh asli buildings mein servers par chalta hai. Azure inhe kuch levels mein group karta hai. Levels samajhne se pata chalta hai ki data kahan hai, users se kitna door hai, aur failure mein kaise bachein.</p>

<h3>Geography, region, availability zone</h3>
<dl class="terms">
<dt>Geography</dt><dd>India jaisa ek market area, jismein aam taur par do ya zyada regions hote hain, data residency aur compliance rules ko dhyan mein rakh kar.</dd>
<dt>Region</dt><dd>Ek area mein low-latency network se jude datacentres ka set. Resources chune hue region mein bante hain, jaise <code>centralindia</code>.</dd>
<dt>Availability zone</dt><dd>Region ke andar ek physically alag location jiski bijli, cooling aur networking independent hoti hai. Jo regions zones support karte hain unmein kam se kam teen hote hain.</dd>
<dt>Region pair</dt><dd>Ek hi geography ke do regions jinhe Microsoft kuch replication aur recovery features ke liye partner maanta hai. India mein Central India ka pair South India hai (verify before publishing, aur verify karo kaun si services pairs use karti hain).</dd>
</dl>

<div class="dia">`+e+`<p class="cap">Ek geography mein kai regions hote hain. Zones region ke andar hote hain. Har region mein zones nahi hote.</p></div>

<h3>India ke regions</h3>
<table class="cmp"><tr><th>Region name</th><th>CLI name</th><th>Notes</th></tr>
<tr><td>Central India</td><td><code>centralindia</code></td><td>Pune. Labs aur kai workloads ke liye achha default. Availability zones support karta hai (verify before publishing).</td></tr>
<tr><td>South India</td><td><code>southindia</code></td><td>Chennai. Disaster recovery ke pair ke roop mein aksar use hota hai. Zone support aur available VM sizes alag ho sakte hain (verify before publishing).</td></tr>
<tr><td>West India</td><td><code>westindia</code></td><td>Mumbai. Naye customers ke liye availability limited ho sakti hai (verify before publishing).</td></tr>
</table>
<p>Table par bharosa karne ke bajay dekho aapki subscription actually kya use kar sakti hai:</p>
<pre class="code">az account list-locations --query "[?contains(name,'india')].{name:name, display:displayName}" --output table</pre>
<p>Illustrative output:</p>
<pre class="out">Name          Display
------------  -------------
<span class="hl">centralindia</span>  Central India
southindia    South India
westindia     West India</pre>

<h3>Region kaise chunein</h3>
<ol>
<li><b>Latency.</b> Users ke sabse paas ka region chuno. India ke learners ke liye Central India ya South India.</li>
<li><b>Data residency aur compliance.</b> Kuch data India ke andar rehna chahiye.</li>
<li><b>Service availability.</b> Har service ya VM size har region mein nahi hota. Agar create capacity ya "not available in this location" jaise message ke saath fail ho to doosra region try karo (exact error text verify karo).</li>
<li><b>Price.</b> Prices region ke hisaab se alag hote hain (Azure pricing pages par verify karo).</li>
<li><b>Resilience.</b> High availability ke liye zones wala region chuno aur resources zones mein failao; disaster recovery ke liye doosre region mein copy rakho.</li>
</ol>

<h3>Zones aur networks: Azure ka farak</h3>
<p>Yeh point un engineers ko surprise karta hai jo AWS jaante hain. Azure mein <b>VNet aur uske subnets regional</b> hote hain. Subnet kisi ek zone se bandha nahi hota. Virtual machine, managed disk ya public IP ko aap zone mein rakhte ho, aur Standard public IP zone-redundant ho sakta hai. To aap ek subnet banate ho aur usmein kai zones ke VMs rakh dete ho.</p>
<div class="note"><p><b>AWS vs Azure.</b> AWS subnet = ek AZ, isliye har AZ ke liye subnet banate ho. Azure subnet = poora region, isliye aap resources ko zones mein rakhte ho. Azure ke zone numbers (1, 2, 3) logical hain aur har subscription ke liye map hote hain, isliye aapka zone 1 kisi aur customer ke zone 1 wali building nahi bhi ho sakta (verify before publishing).</p></div>

<div class="eg"><p><b>Worked example.</b> Hyderabad ki ek learner lab VNet aur VM deploy karti hai. Central India low latency deta hai aur data India mein rakhta hai, isliye woh <code>centralindia</code> chunti hai. Uska VM size wahan available nahi hai, to woh pehle usi region mein doosra size try karti hai, aur uske baad hi <code>southindia</code>. Kyunki VNets regional hote hain, Central India ke VNet mein South India ka VM nahi rakh sakte. Uske liye doosra VNet aur peering chahiye, jo baad ka module hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> VNet ek region mein aur VM ya NIC doosre region mein banana aur dropdown dhundhte rehna. NIC ka region VNet ke region jaisa hona chahiye, aur VM ka region NIC ke region jaisa.</p></div>

<div class="exam"><p><b>Exam trap.</b> AZ-900 region, region pair aur availability zone ka farak puchta hai, aur yeh ki zones datacentre failure se bachate hain jabki region pairs regional disaster mein madad karte hain. Sab regions mein zones nahi hote. VNet ek region ke saare zones mein hota hai aur kabhi regions ke beech nahi phailta.</p></div>

<div class="scn"><h4>Galat jagah capacity</h4><p>Ek trainer ki script ne batch class ke liye South India mein VM banaya, aur aadhe students ko error mila ki chuna hua size available nahi hai. Usne code nahi badla. CLI se region mein offered sizes check kiye, ek doosra size chuna jo maujood tha, aur batch chal gaya. Ek saal baad script region aur size ko parameters ki tarah leti thi.</p><p><b>Lesson:</b> region choice aur size availability design ka hissa hain, isliye unhe parameters banao.</p></div>

<div class="iv"><p class="q">"Availability zone aur region pair mein kya farak hai?"</p><p>Zones ek region ke andar alag datacentre locations hain aur single datacentre failure se bachate hain. Region pair ek geography ke do regions hain jo disaster recovery aur kuch replication ke liye use hote hain. Bolo ki VNets regional hain aur zone aap VM, disk ya public IP par chunte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Geography mein regions hote hain; region mein zones (agar supported).</li>
<li>Indian regions: Central India (Pune), South India (Chennai), West India (Mumbai); availability verify karo.</li>
<li>VNets aur subnets regional hain; VMs, disks aur Standard public IPs zonal ya zone-redundant.</li>
<li>Latency, residency, service availability, price aur resilience se chuno.</li>
<li>Regions az account list-locations se list karo.</li>
</ul></div>
`}};export{t as default};