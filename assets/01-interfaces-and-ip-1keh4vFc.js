var e={id:`interfaces`,h:{en:`Interfaces and IP addresses`,hi:`Interfaces aur IP addresses`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn how a Forcepoint-style Next Generation Firewall engine gets its network identity from the Security Management Center (SMC): interfaces, VLANs, routes, aliases, cluster addresses, contact addresses, DHCP relay and antispoofing. You will configure a branch engine, add Staff and Servers VLANs, build routes through two ISPs and repair an engine that lost contact with the SMC. This is independent training based on published documentation, with an original console. It does not claim to cover any certification, so check the vendor training pages before you book an exam.</p>
<p><b>Prerequisites.</b> You should know what an IP address, a subnet mask and a default gateway are, and you should have finished the first module of this track (adding the engine and making first contact). No firewall experience is needed. Our tagline for the whole track: <i>click-ops, but you understand what each click does.</i></p>

<h3>Start with an analogy: the firewall is a gatehouse with several doors</h3>
<p>Imagine the Pune office of Network Kings as a compound with a security gatehouse. The gatehouse has one door to the street (the ISP), one to the Staff building, one to the server building and one small staff-only door used by the head-office manager (the SMC) to give instructions. Each door has a house number on its own lane. A guard (the firewall engine) can only hand a visitor to a lane if the guard has a door on that lane. <b>Interfaces are the doors, IP addresses are the house numbers, and routes are the signboards that say which door to use.</b> In this module we fix the doors first.</p>

<h3>The engine and its interfaces</h3>
<p>An <b>engine</b> is the firewall software that inspects and forwards traffic. The SMC holds the engine <b>element</b>, which is its configuration in the database. When you press Install policy, the SMC compiles that configuration and sends it to the engine. An <b>interface</b> is a network connection of the engine. Each interface has an <b>Interface ID</b>, a number inside the SMC configuration, such as 0, 1, 2 and 3. On the real appliance the Interface ID is mapped to a physical port or a virtual NIC by the NGFW Configuration Wizard. Check the documentation for your NGFW version for how the mapping is shown. In our simulator the naming is simple: Interface ID 0 is port eth0, 1 is eth1, and so on.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Pune branch engine with four interfaces">
<rect x="250" y="70" width="140" height="120" rx="10" fill="#bae6fd" stroke="#64748b"/>
<text x="320" y="118" text-anchor="middle" class="svg-ink" font-size="14">NK-PUNE-FW</text>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">engine</text>
<rect x="20" y="20" width="150" height="46" rx="8" fill="#ddd6fe"/><text x="95" y="40" text-anchor="middle" class="svg-ink" font-size="12">NK-SMC</text><text x="95" y="57" text-anchor="middle" class="svg-muted" font-size="12">10.0.0.10/24</text>
<rect x="470" y="20" width="150" height="46" rx="8" fill="#fed7aa"/><text x="545" y="40" text-anchor="middle" class="svg-ink" font-size="12">ISP</text><text x="545" y="57" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.1/30</text>
<rect x="20" y="194" width="150" height="46" rx="8" fill="#bbf7d0"/><text x="95" y="214" text-anchor="middle" class="svg-ink" font-size="12">STAFF-PC</text><text x="95" y="231" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.10/24</text>
<rect x="470" y="194" width="150" height="46" rx="8" fill="#fde68a"/><text x="545" y="214" text-anchor="middle" class="svg-ink" font-size="12">WEB1</text><text x="545" y="231" text-anchor="middle" class="svg-muted" font-size="12">172.16.20.20/24</text>
<line x1="170" y1="43" x2="262" y2="82" stroke="#64748b" stroke-width="2"/><text x="185" y="88" class="svg-accent" font-size="12">eth0 10.0.0.1/24</text>
<line x1="470" y1="43" x2="378" y2="82" stroke="#64748b" stroke-width="2"/><text x="395" y="60" class="svg-accent" font-size="12">eth1 203.0.113.2/30</text>
<line x1="170" y1="217" x2="262" y2="178" stroke="#64748b" stroke-width="2"/><text x="180" y="176" class="svg-accent" font-size="12">eth2 10.1.1.1/24</text>
<line x1="470" y1="217" x2="378" y2="178" stroke="#64748b" stroke-width="2"/><text x="398" y="200" class="svg-accent" font-size="12">eth3 172.16.20.1/24</text>
</svg><p class="cap">The Pune branch used in every lab of this track. Four interfaces, four different networks.</p></div>

<h3>The four interfaces of the Pune branch</h3>
<table class="cmp"><tr><th>Interface ID</th><th>Port</th><th>Role</th><th>Address</th></tr>
<tr><td>0</td><td>eth0</td><td>Control interface (talks to the SMC)</td><td>10.0.0.1/24</td></tr>
<tr><td>1</td><td>eth1</td><td>WAN to the ISP</td><td>203.0.113.2/30</td></tr>
<tr><td>2</td><td>eth2</td><td>Staff LAN</td><td>10.1.1.1/24</td></tr>
<tr><td>3</td><td>eth3</td><td>DMZ with WEB1</td><td>172.16.20.1/24</td></tr></table>
<p>The <b>control interface</b> is special. The engine uses it to contact the SMC and the SMC uses it to reach the engine (the primary IP address of the engine). If you break it, you can lose management. Remember this when you edit interfaces; lab 4 is built around it.</p>

<h3>Types of IP address on an interface</h3>
<p>A <b>NDI</b> is a Node Dedicated IP address. It belongs to one engine node only and is used for management, for the SMC, for pings to that exact node and, on a single firewall, for normal traffic too. A <b>CVI</b> is a Cluster Virtual IP address. It is shared by all nodes of a cluster, and the cluster owns it as one unit. Hosts use the CVI as their gateway, so they never notice which node is working. A single firewall has just one node, so its addresses are plain NDIs. Chapter 5 explains clusters fully. For now remember: <b>CVI = the address the world talks to, NDI = the address of one node.</b></p>

<div class="eg"><p><b>Worked example.</b> We add Staff LAN to NK-PUNE-FW. Engine node: one. Interface ID 2, address 10.1.1.1, prefix length 24. The network is 10.1.1.0/24, the usable range is 10.1.1.1 to 10.1.1.254 and STAFF-PC (10.1.1.10) uses 10.1.1.1 as its gateway. If you accidentally type 10.1.1.1/16 the engine would think that the whole 10.1.0.0/16 range is on this one cable, and routing to other 10.1.x.x branches would break. Always check the prefix length, not only the address.</p></div>

<h3>The sequence in the console</h3>
<ol>
<li>Open the Engines page and edit the engine element.</li>
<li>Go to its interfaces and add the interface with its ID, address and prefix length.</li>
<li>Save the element. The change exists only in the SMC database.</li>
<li>Press <b>Install policy</b>. The SMC validates, compiles and sends the configuration. Only now does the engine change.</li>
</ol>
<p>After the install you can verify from the engine shell with a normal Linux tool:</p>
<pre class="code"><span class="c"># on the engine shell (simulator)</span>
ip -br addr</pre>
<pre class="out">lo     UNKNOWN  127.0.0.1/8
eth0   UP       <span class="hl">10.0.0.1/24</span>
eth1   UP       203.0.113.2/30
eth2   UP       10.1.1.1/24
eth3   UP       172.16.20.1/24</pre>

<div class="warn"><p><b>Common mistakes.</b> Editing an interface and forgetting to install. Changing the control interface address without thinking about how the SMC will reach it. Typing the wrong prefix length. Using the network address (10.1.1.0) or broadcast address as a host address. Mixing up Interface ID with the physical port label on the box.</p></div>
<div class="exam"><p><b>Exam trap.</b> The configuration lives in the SMC. "I saved it in the Management Client" does not mean "the engine is using it". An invalid interface address is a validation error and blocks the install. A failed install changes nothing.</p></div>

<div class="scn"><h4>The new branch with the wrong mask</h4><p>A junior engineer at Network Kings built a branch engine and typed the Staff LAN as 10.1.1.1/16. Staff laptops could reach the engine but the link to HQ for 10.1.2.0/24 stopped working, because the engine believed 10.1.2.0/24 was directly connected on the Staff cable and never forwarded to it. The senior engineer compared the interface list with the address plan, corrected the prefix to /24, installed the policy and the routes came back.</p><p><b>Lesson:</b> an interface address is also a route to a whole network. Check address and prefix against the plan before you install.</p></div>

<div class="iv"><p class="q">"What is the difference between an Interface ID and a physical port on an NGFW engine?"</p><p>A strong answer: the Interface ID is a number in the engine configuration in the SMC; it is mapped to a physical port or virtual NIC on the engine. That mapping makes the same configuration portable between hardware. Then add that the control interface is used for SMC communication and should be handled with care. Mention that exact mapping screens depend on the NGFW version.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The engine configuration lives in the SMC and reaches the engine only after Install policy.</li>
<li>Interface ID is the logical number in the SMC; the port mapping depends on hardware and version.</li>
<li>The control interface carries engine-to-SMC communication; protect it.</li>
<li>NDI is the address of one node, CVI is the shared cluster address.</li>
<li>Address plus prefix length defines a connected network, so verify both.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki Forcepoint-style Next Generation Firewall engine ko apni network identity Security Management Center (SMC) se kaise milti hai: interfaces, VLANs, routes, aliases, cluster addresses, contact addresses, DHCP relay aur antispoofing. Aap ek branch engine configure karoge, Staff aur Servers VLANs jodoge, do ISPs ke through routes banaoge aur ek aisa engine repair karoge jo SMC se contact kho chuka hai. Yeh published documentation par based independent training hai, original console ke saath. Yeh kisi certification ko cover karne ka claim nahi karta, isliye exam book karne se pehle vendor ke training pages check karo.</p>
<p><b>Prerequisites.</b> Aapko IP address, subnet mask aur default gateway kya hote hain yeh pata hona chahiye, aur is track ka pehla module (engine add karna aur first contact) complete hona chahiye. Firewall ka koi experience zaroori nahi. Poore track ki tagline: <i>click-ops, but you understand what each click does.</i></p>

<h3>Analogy se shuru karo: firewall ek gatehouse hai jisme kai darwaze hain</h3>
<p>Network Kings ke Pune office ko ek compound socho jiske gate par security gatehouse hai. Gatehouse mein ek darwaza street (ISP) ki taraf hai, ek Staff building ki taraf, ek server building ki taraf, aur ek chhota staff-only darwaza jo head-office manager (SMC) instructions dene ke liye use karta hai. Har darwaze ki apni lane par apna house number hai. Guard (firewall engine) kisi visitor ko lane tak tabhi bhej sakta hai jab uska us lane par darwaza ho. <b>Interfaces darwaze hain, IP addresses house numbers hain, aur routes signboards hain jo batate hain kaunsa darwaza use karna hai.</b> Is module mein pehle darwaze theek karte hain.</p>

<h3>Engine aur uske interfaces</h3>
<p><b>Engine</b> woh firewall software hai jo traffic inspect aur forward karta hai. SMC engine <b>element</b> rakhta hai, yaani database mein uski configuration. Jab aap Install policy dabate ho, SMC us configuration ko compile karke engine ko bhejta hai. <b>Interface</b> engine ka ek network connection hai. Har interface ka ek <b>Interface ID</b> hota hai, SMC configuration ke andar ek number, jaise 0, 1, 2 aur 3. Real appliance par Interface ID ko NGFW Configuration Wizard physical port ya virtual NIC se map karta hai. Mapping kaise dikhti hai, iske liye apne NGFW version ki documentation check karo. Hamare simulator mein naming simple hai: Interface ID 0 matlab port eth0, 1 matlab eth1, aur aise hi.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Pune branch engine ke chaar interfaces">
<rect x="250" y="70" width="140" height="120" rx="10" fill="#bae6fd" stroke="#64748b"/>
<text x="320" y="118" text-anchor="middle" class="svg-ink" font-size="14">NK-PUNE-FW</text>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">engine</text>
<rect x="20" y="20" width="150" height="46" rx="8" fill="#ddd6fe"/><text x="95" y="40" text-anchor="middle" class="svg-ink" font-size="12">NK-SMC</text><text x="95" y="57" text-anchor="middle" class="svg-muted" font-size="12">10.0.0.10/24</text>
<rect x="470" y="20" width="150" height="46" rx="8" fill="#fed7aa"/><text x="545" y="40" text-anchor="middle" class="svg-ink" font-size="12">ISP</text><text x="545" y="57" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.1/30</text>
<rect x="20" y="194" width="150" height="46" rx="8" fill="#bbf7d0"/><text x="95" y="214" text-anchor="middle" class="svg-ink" font-size="12">STAFF-PC</text><text x="95" y="231" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.10/24</text>
<rect x="470" y="194" width="150" height="46" rx="8" fill="#fde68a"/><text x="545" y="214" text-anchor="middle" class="svg-ink" font-size="12">WEB1</text><text x="545" y="231" text-anchor="middle" class="svg-muted" font-size="12">172.16.20.20/24</text>
<line x1="170" y1="43" x2="262" y2="82" stroke="#64748b" stroke-width="2"/><text x="185" y="88" class="svg-accent" font-size="12">eth0 10.0.0.1/24</text>
<line x1="470" y1="43" x2="378" y2="82" stroke="#64748b" stroke-width="2"/><text x="395" y="60" class="svg-accent" font-size="12">eth1 203.0.113.2/30</text>
<line x1="170" y1="217" x2="262" y2="178" stroke="#64748b" stroke-width="2"/><text x="180" y="176" class="svg-accent" font-size="12">eth2 10.1.1.1/24</text>
<line x1="470" y1="217" x2="378" y2="178" stroke="#64748b" stroke-width="2"/><text x="398" y="200" class="svg-accent" font-size="12">eth3 172.16.20.1/24</text>
</svg><p class="cap">Pune branch, jo is track ke har lab mein use hota hai. Chaar interfaces, chaar alag networks.</p></div>

<h3>Pune branch ke chaar interfaces</h3>
<table class="cmp"><tr><th>Interface ID</th><th>Port</th><th>Role</th><th>Address</th></tr>
<tr><td>0</td><td>eth0</td><td>Control interface (SMC se baat karta hai)</td><td>10.0.0.1/24</td></tr>
<tr><td>1</td><td>eth1</td><td>ISP ki taraf WAN</td><td>203.0.113.2/30</td></tr>
<tr><td>2</td><td>eth2</td><td>Staff LAN</td><td>10.1.1.1/24</td></tr>
<tr><td>3</td><td>eth3</td><td>WEB1 wala DMZ</td><td>172.16.20.1/24</td></tr></table>
<p><b>Control interface</b> khaas hai. Engine isse SMC ko contact karta hai aur SMC isse engine tak pahunchta hai (engine ka primary IP address). Ise tod diya to management kho sakte ho. Interfaces edit karte waqt yeh yaad rakho; lab 4 isi par bana hai.</p>

<h3>Interface par IP address ke types</h3>
<p><b>NDI</b> matlab Node Dedicated IP address. Yeh sirf ek engine node ka hota hai aur management, SMC, us exact node ko ping, aur single firewall par normal traffic ke liye bhi use hota hai. <b>CVI</b> matlab Cluster Virtual IP address. Yeh cluster ke saare nodes ka shared address hai, aur cluster ise ek unit ki tarah own karta hai. Hosts CVI ko gateway banate hain, isliye unhe pata nahi chalta ki kaunsa node kaam kar raha hai. Single firewall mein sirf ek node hota hai, isliye uske addresses simple NDI hote hain. Chapter 5 clusters ko poori tarah samjhata hai. Abhi yaad rakho: <b>CVI = woh address jisse duniya baat karti hai, NDI = ek node ka address.</b></p>

<div class="eg"><p><b>Worked example.</b> NK-PUNE-FW par Staff LAN jod rahe hain. Engine node: ek. Interface ID 2, address 10.1.1.1, prefix length 24. Network 10.1.1.0/24 hai, usable range 10.1.1.1 se 10.1.1.254 hai aur STAFF-PC (10.1.1.10) 10.1.1.1 ko gateway banata hai. Agar galti se 10.1.1.1/16 type kar diya, to engine sochega ki poori 10.1.0.0/16 range isi ek cable par hai, aur dusre 10.1.x.x branches ki routing toot jayegi. Sirf address nahi, hamesha prefix length bhi check karo.</p></div>

<h3>Console mein sequence</h3>
<ol>
<li>Engines page kholo aur engine element edit karo.</li>
<li>Uske interfaces mein jao aur ID, address aur prefix length ke saath interface jodo.</li>
<li>Element save karo. Change sirf SMC database mein hai.</li>
<li><b>Install policy</b> dabao. SMC validate, compile aur configuration bhejta hai. Ab jaakar engine badalta hai.</li>
</ol>
<p>Install ke baad engine shell se normal Linux tool se verify kar sakte ho:</p>
<pre class="code"><span class="c"># on the engine shell (simulator)</span>
ip -br addr</pre>
<pre class="out">lo     UNKNOWN  127.0.0.1/8
eth0   UP       <span class="hl">10.0.0.1/24</span>
eth1   UP       203.0.113.2/30
eth2   UP       10.1.1.1/24
eth3   UP       172.16.20.1/24</pre>

<div class="warn"><p><b>Common mistakes.</b> Interface edit karke install bhool jana. Control interface ka address bina socche badalna ki SMC ab engine tak kaise pahunchega. Galat prefix length type karna. Network address (10.1.1.0) ya broadcast address ko host address banana. Interface ID aur box par likhe physical port label ko mix kar dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Configuration SMC mein rehti hai. "Maine Management Client mein save kiya" ka matlab "engine use kar raha hai" nahi hai. Invalid interface address validation error hai aur install block karta hai. Failed install kuch nahi badalta.</p></div>

<div class="scn"><h4>Galat mask wala naya branch</h4><p>Network Kings ke ek junior engineer ne branch engine banaya aur Staff LAN ko 10.1.1.1/16 type kar diya. Staff laptops engine tak pahunch rahe the, lekin HQ ke 10.1.2.0/24 ka link band ho gaya, kyunki engine maan raha tha ki 10.1.2.0/24 Staff cable par hi directly connected hai aur usne kabhi forward hi nahi kiya. Senior engineer ne interface list ko address plan se compare kiya, prefix ko /24 kiya, policy install ki aur routes wapas aa gaye.</p><p><b>Lesson:</b> interface address ek poore network ka route bhi hota hai. Install se pehle address aur prefix ko plan se check karo.</p></div>

<div class="iv"><p class="q">"NGFW engine par Interface ID aur physical port mein kya fark hai?"</p><p>Strong answer: Interface ID SMC mein engine configuration ka number hai; woh physical port ya virtual NIC se map hota hai. Is mapping se same configuration alag hardware par portable rehti hai. Phir bolo ki control interface SMC communication ke liye use hota hai aur ise dhyan se handle karna chahiye. Yeh bhi bolo ki mapping screens NGFW version par depend karti hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Engine configuration SMC mein rehti hai aur Install policy ke baad hi engine tak pahunchti hai.</li>
<li>Interface ID SMC ka logical number hai; port mapping hardware aur version par depend karti hai.</li>
<li>Control interface engine-to-SMC communication ke liye hai; ise protect karo.</li>
<li>NDI ek node ka address hai, CVI shared cluster address hai.</li>
<li>Address plus prefix length connected network define karte hain, dono verify karo.</li>
</ul></div>
`}};export{e as default};