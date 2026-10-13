var e={id:`modes`,h:{en:`Boot process and ASA modes: routed, transparent, single and multiple context`,hi:`Boot process aur ASA modes: routed, transparent, single aur multiple context`},body:{en:`
<p>Before you type a single interface command, you should know two things about the box in front of you: <b>how it boots</b>, so you can recover it when something goes wrong, and <b>which mode it is in</b>, because the mode decides what the rest of the configuration even looks like. Think of a building: before you arrange the furniture you check whether it is one big house or an apartment block with separate flats, and whether the rooms have walls or are one open hall.</p>

<h3>How an ASA boots</h3>
<ol>
<li><b>ROMMON</b> (ROM monitor) starts first. It is the bootloader. If you press Break or Esc during the countdown on the console, you stop here. ROMMON is used for password recovery and for loading an image over TFTP when the flash image is broken.</li>
<li>ROMMON loads the <b>ASA software image</b> from flash (<code>disk0:</code>), following the <code>boot system</code> command if present, otherwise the first valid image it finds.</li>
<li>The image loads the <b>startup-config</b>. If there is none, many models offer an interactive <code>setup</code> dialog, or boot the <b>factory-default</b> configuration.</li>
<li>You get the <code>ciscoasa&gt;</code> prompt (or your hostname).</li>
</ol>
<p>On the Secure Firewall 4100 and 9300 the ASA runs as an application on top of the chassis operating system (FXOS); on the smaller 1000, 2100 and 3100 series in ASA appliance mode this layer stays mostly hidden. On the ASAv the hypervisor replaces ROMMON, but the image-then-config order is the same.</p>

<pre class="out">NK-ASA# show version
<span class="hl">Cisco Adaptive Security Appliance Software Version 9.20(3)</span>
Device Manager Version 7.20(2)
System image file is "boot:/asa9203-smp-k8.bin"
Config file at boot was "startup-config"
NK-ASA up 2 days 4 hours
Hardware:   ASAv, 8192 MB RAM, CPU Xeon 4100/6100/8100 series 2200 MHz, 1 CPU (4 cores)
...(trimmed)</pre>
<p>Look at the software version (features and command syntax depend on it), the image file, and which config was used at boot. If it says the startup-config was not found, you are looking at an unconfigured box.</p>

<h3>Firewall mode: routed or transparent</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Routed versus transparent">
<text x="160" y="22" text-anchor="middle" class="svg-accent" font-size="14">Routed (default)</text>
<rect x="20" y="40" width="80" height="34" rx="8" fill="#bbf7d0"/><text x="60" y="62" text-anchor="middle" class="svg-ink" font-size="12">10.0.1.0/24</text>
<rect x="120" y="36" width="80" height="42" rx="8" fill="#fed7aa"/><text x="160" y="62" text-anchor="middle" class="svg-ink" font-size="13">ASA hop</text>
<rect x="220" y="40" width="90" height="34" rx="8" fill="#fde68a"/><text x="265" y="62" text-anchor="middle" class="svg-ink" font-size="12">203.0.113.0/29</text>
<line x1="100" y1="57" x2="120" y2="57" stroke="#64748b"/><line x1="200" y1="57" x2="220" y2="57" stroke="#64748b"/>
<text x="160" y="105" text-anchor="middle" class="svg-muted" font-size="12">Different subnet on each side</text>
<text x="480" y="22" text-anchor="middle" class="svg-accent" font-size="14">Transparent</text>
<rect x="340" y="40" width="80" height="34" rx="8" fill="#bbf7d0"/><text x="380" y="62" text-anchor="middle" class="svg-ink" font-size="12">10.0.5.0/24</text>
<rect x="440" y="36" width="80" height="42" rx="8" fill="#fed7aa"/><text x="480" y="62" text-anchor="middle" class="svg-ink" font-size="13">ASA bridge</text>
<rect x="540" y="40" width="80" height="34" rx="8" fill="#bbf7d0"/><text x="580" y="62" text-anchor="middle" class="svg-ink" font-size="12">10.0.5.0/24</text>
<line x1="420" y1="57" x2="440" y2="57" stroke="#64748b"/><line x1="520" y1="57" x2="540" y2="57" stroke="#64748b"/>
<text x="480" y="105" text-anchor="middle" class="svg-muted" font-size="12">Same subnet, ASA is a bump in the wire</text>
<rect x="20" y="130" width="600" height="56" rx="8" fill="#e2e8f0"/>
<text x="320" y="153" text-anchor="middle" class="svg-ink" font-size="13">Context mode: single (one firewall) or multiple (many virtual firewalls)</text>
<text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">Both choices are independent: e.g. multiple context with some routed and some transparent contexts</text>
</svg><p class="cap">Two independent choices: how the ASA forwards (routed or transparent) and how many firewalls it pretends to be (single or multiple context).</p></div>
<p>In <b>routed mode</b> (the default and the mode for this whole module) the ASA is a layer 3 hop. Each interface is in a different subnet, hosts use the ASA as their gateway, and it can run static and dynamic routing and NAT.</p>
<p>In <b>transparent mode</b> the ASA is a layer 2 <b>bump in the wire</b>. Interfaces are grouped into a <b>bridge group</b> and share one subnet; a <b>BVI</b> (bridge virtual interface) gives the bridge group a management address. You insert it into an existing network without re-addressing anything. You will build one in the later deployment module.</p>
<pre class="code"><span class="c">! check the current mode</span>
show firewall
<span class="c">! change it (WARNING: this clears the running configuration)</span>
firewall transparent</pre>
<pre class="out">NK-ASA# show firewall
<span class="hl">Firewall mode: Router</span></pre>

<h3>Context mode: single or multiple</h3>
<p><b>Single context</b> (the default) means one ASA equals one firewall with one policy. <b>Multiple context</b> mode splits one physical ASA into several <b>security contexts</b>, each a virtual firewall with its own interfaces, routing table, NAT, ACLs and administrators. Service providers and large enterprises use it to give each customer or department its own firewall on shared hardware.</p>
<ul>
<li>The <b>system execution space</b> defines contexts and allocates interfaces to them. It has no data-plane policy of its own.</li>
<li>The <b>admin context</b> is a normal context that also has access to the system for management.</li>
<li>Each context can be routed or transparent.</li>
<li>Some features have limits in multiple context mode (for example multicast routing, and remote-access VPN on older releases), and the number of contexts depends on the licence.</li>
</ul>
<pre class="code">show mode
<span class="c">! convert (asks for confirmation, converts the config and reloads)</span>
mode multiple
<span class="c">! later, from the system space</span>
changeto context CUST-A
changeto system</pre>
<pre class="out">NK-ASA# show mode
<span class="hl">Security context mode: single</span></pre>

<div class="eg"><p><b>Worked example.</b> A managed-services team hosts three customers on one Secure Firewall. They run multiple context mode with contexts CUST-A, CUST-B and CUST-C. CUST-A needs a normal internet edge (routed). CUST-C must be inserted between an existing router and its servers without changing any IP address, so that context is transparent. Each customer's engineer can log in to their own context only.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Typing <code>firewall transparent</code> on a configured box "to see what it does": the running configuration is erased. Converting to multiple context during business hours: it needs a reload. Forgetting that a console Break during boot drops you into ROMMON; type <code>boot</code> to continue.</p></div>

<div class="exam"><p><b>Exam trap.</b> Routed vs transparent is about <b>how traffic is forwarded</b> (layer 3 hop vs layer 2 bridge). Single vs multiple is about <b>how many virtual firewalls</b> share the box. They are separate settings, and a question that mixes them is testing whether you know that.</p></div>

<div class="scn"><h4>The upgrade that booted the wrong image</h4><p>After copying a new image to <code>disk0:</code> and reloading, an ASA came up on the old version. <code>show version</code> still showed the old image file. <code>show running-config boot</code> revealed an old <code>boot system</code> line pointing to the previous image. The engineer removed it, added a line for the new image, saved and reloaded during the window. The box booted the new version.</p><p><b>Lesson:</b> the boot order follows <code>boot system</code> lines first; always check them and save before reloading.</p></div>

<div class="iv"><p class="q">"When would you use transparent mode, and when multiple context mode?"</p><p>Strong answer: transparent mode when you must insert a firewall into an existing subnet without re-addressing, for example in front of a legacy server farm; the ASA bridges and is not a routing hop. Multiple context when one physical firewall must serve several tenants or departments with separate policies and administrators. Mention that the two are independent, that changing firewall mode clears the config, and that multiple context has feature and licence limits.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Boot order: ROMMON, image from <code>disk0:</code> (per <code>boot system</code>), then startup-config.</li>
<li><code>show version</code> tells you the software, image and which config was loaded.</li>
<li>Routed mode = layer 3 hop (default); transparent mode = layer 2 bridge with bridge groups and a BVI.</li>
<li>Single context = one firewall; multiple context = several virtual firewalls with a system space and an admin context.</li>
<li><code>show firewall</code> and <code>show mode</code> check the modes; changing them is disruptive.</li>
</ul></div>
`,hi:`
<p>Ek bhi interface command type karne se pehle, aapko saamne wale box ke baare mein do cheezein pata honi chahiye: <b>yeh boot kaise hota hai</b>, taaki kuch galat ho to aap ise recover kar sako, aur <b>yeh kis mode mein hai</b>, kyunki mode hi decide karta hai ki baaki configuration dikhegi kaisi. Ek building socho: furniture lagane se pehle aap check karte ho ki yeh ek bada ghar hai ya alag alag flats wala apartment block, aur kamron mein deewarein hain ya ek khula hall hai.</p>

<h3>ASA boot kaise hota hai</h3>
<ol>
<li>Sabse pehle <b>ROMMON</b> (ROM monitor) start hota hai. Yeh bootloader hai. Agar aap console par countdown ke dauraan Break ya Esc dabao, to yahin ruk jaate ho. ROMMON password recovery ke liye aur flash image kharab hone par TFTP se image load karne ke liye use hota hai.</li>
<li>ROMMON flash (<code>disk0:</code>) se <b>ASA software image</b> load karta hai, agar <code>boot system</code> command hai to use follow karta hai, warna pehli valid image jo mile.</li>
<li>Image <b>startup-config</b> load karta hai. Agar koi nahi hai, to kai models interactive <code>setup</code> dialog offer karte hain, ya <b>factory-default</b> configuration boot karte hain.</li>
<li>Aapko <code>ciscoasa&gt;</code> prompt (ya aapka hostname) milta hai.</li>
</ol>
<p>Secure Firewall 4100 aur 9300 par ASA chassis operating system (FXOS) ke upar ek application ki tarah chalta hai; chhoti 1000, 2100 aur 3100 series par ASA appliance mode mein yeh layer zyada tar chhupi rehti hai. ASAv par hypervisor ROMMON ki jagah leta hai, lekin pehle image phir config wala order same rehta hai.</p>

<pre class="out">NK-ASA# show version
<span class="hl">Cisco Adaptive Security Appliance Software Version 9.20(3)</span>
Device Manager Version 7.20(2)
System image file is "boot:/asa9203-smp-k8.bin"
Config file at boot was "startup-config"
NK-ASA up 2 days 4 hours
Hardware:   ASAv, 8192 MB RAM, CPU Xeon 4100/6100/8100 series 2200 MHz, 1 CPU (4 cores)
...(trimmed)</pre>
<p>Software version dekho (features aur command syntax is par depend karte hain), image file, aur boot par kaunsi config use hui. Agar likha hai ki startup-config nahi mili, to aap unconfigured box dekh rahe ho.</p>

<h3>Firewall mode: routed ya transparent</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Routed banaam transparent">
<text x="160" y="22" text-anchor="middle" class="svg-accent" font-size="14">Routed (default)</text>
<rect x="20" y="40" width="80" height="34" rx="8" fill="#bbf7d0"/><text x="60" y="62" text-anchor="middle" class="svg-ink" font-size="12">10.0.1.0/24</text>
<rect x="120" y="36" width="80" height="42" rx="8" fill="#fed7aa"/><text x="160" y="62" text-anchor="middle" class="svg-ink" font-size="13">ASA hop</text>
<rect x="220" y="40" width="90" height="34" rx="8" fill="#fde68a"/><text x="265" y="62" text-anchor="middle" class="svg-ink" font-size="12">203.0.113.0/29</text>
<line x1="100" y1="57" x2="120" y2="57" stroke="#64748b"/><line x1="200" y1="57" x2="220" y2="57" stroke="#64748b"/>
<text x="160" y="105" text-anchor="middle" class="svg-muted" font-size="12">Har side alag subnet</text>
<text x="480" y="22" text-anchor="middle" class="svg-accent" font-size="14">Transparent</text>
<rect x="340" y="40" width="80" height="34" rx="8" fill="#bbf7d0"/><text x="380" y="62" text-anchor="middle" class="svg-ink" font-size="12">10.0.5.0/24</text>
<rect x="440" y="36" width="80" height="42" rx="8" fill="#fed7aa"/><text x="480" y="62" text-anchor="middle" class="svg-ink" font-size="13">ASA bridge</text>
<rect x="540" y="40" width="80" height="34" rx="8" fill="#bbf7d0"/><text x="580" y="62" text-anchor="middle" class="svg-ink" font-size="12">10.0.5.0/24</text>
<line x1="420" y1="57" x2="440" y2="57" stroke="#64748b"/><line x1="520" y1="57" x2="540" y2="57" stroke="#64748b"/>
<text x="480" y="105" text-anchor="middle" class="svg-muted" font-size="12">Same subnet, ASA taar mein ek bump</text>
<rect x="20" y="130" width="600" height="56" rx="8" fill="#e2e8f0"/>
<text x="320" y="153" text-anchor="middle" class="svg-ink" font-size="13">Context mode: single (ek firewall) ya multiple (kai virtual firewalls)</text>
<text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">Dono choices independent: jaise multiple context mein kuch routed aur kuch transparent contexts</text>
</svg><p class="cap">Do independent choices: ASA forward kaise karta hai (routed ya transparent) aur yeh kitne firewalls hone ka dikhawa karta hai (single ya multiple context).</p></div>
<p><b>Routed mode</b> (default, aur is poore module ka mode) mein ASA ek layer 3 hop hai. Har interface alag subnet mein hota hai, hosts ASA ko apna gateway use karte hain, aur yeh static aur dynamic routing aur NAT chala sakta hai.</p>
<p><b>Transparent mode</b> mein ASA ek layer 2 <b>bump in the wire</b> hai. Interfaces ek <b>bridge group</b> mein group hote hain aur ek hi subnet share karte hain; <b>BVI</b> (bridge virtual interface) bridge group ko management address deta hai. Aap ise bina kuch re-address kiye existing network mein daal dete ho. Aap ise baad wale deployment module mein banaoge.</p>
<pre class="code"><span class="c">! current mode check karo</span>
show firewall
<span class="c">! badlo (WARNING: yeh running configuration clear kar deta hai)</span>
firewall transparent</pre>
<pre class="out">NK-ASA# show firewall
<span class="hl">Firewall mode: Router</span></pre>

<h3>Context mode: single ya multiple</h3>
<p><b>Single context</b> (default) ka matlab hai ek ASA barabar ek firewall, ek policy ke saath. <b>Multiple context</b> mode ek physical ASA ko kai <b>security contexts</b> mein baant deta hai, har ek virtual firewall apne interfaces, routing table, NAT, ACLs aur administrators ke saath. Service providers aur bade enterprises ise har customer ya department ko shared hardware par apna firewall dene ke liye use karte hain.</p>
<ul>
<li><b>System execution space</b> contexts define karta hai aur unhe interfaces allocate karta hai. Iski apni koi data-plane policy nahi hoti.</li>
<li><b>Admin context</b> ek normal context hai jiske paas management ke liye system ka access bhi hota hai.</li>
<li>Har context routed ya transparent ho sakta hai.</li>
<li>Multiple context mode mein kuch features ki limits hain (jaise multicast routing, aur purane releases par remote-access VPN), aur contexts ki sankhya licence par depend karti hai.</li>
</ul>
<pre class="code">show mode
<span class="c">! convert (confirmation maangta hai, config convert karta hai aur reload karta hai)</span>
mode multiple
<span class="c">! baad mein, system space se</span>
changeto context CUST-A
changeto system</pre>
<pre class="out">NK-ASA# show mode
<span class="hl">Security context mode: single</span></pre>

<div class="eg"><p><b>Worked example.</b> Ek managed-services team ek Secure Firewall par teen customers host karti hai. Woh multiple context mode chalate hain jismein contexts CUST-A, CUST-B aur CUST-C hain. CUST-A ko normal internet edge (routed) chahiye. CUST-C ko ek existing router aur uske servers ke beech bina koi IP address badle daalna hai, isliye woh context transparent hai. Har customer ka engineer sirf apne context mein login kar sakta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Configured box par "dekhne ke liye ki kya hota hai" <code>firewall transparent</code> type karna: running configuration mit jaati hai. Business hours mein multiple context mein convert karna: ise reload chahiye. Bhool jaana ki boot ke dauraan console Break aapko ROMMON mein gira deta hai; aage badhne ke liye <code>boot</code> type karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Routed vs transparent is baare mein hai ki <b>traffic forward kaise hota hai</b> (layer 3 hop vs layer 2 bridge). Single vs multiple is baare mein hai ki <b>kitne virtual firewalls</b> box share karte hain. Yeh alag settings hain, aur jo question inhe mix karta hai woh test kar raha hai ki aap yeh jaante ho ya nahi.</p></div>

<div class="scn"><h4>Upgrade jisne galat image boot ki</h4><p>Nayi image <code>disk0:</code> par copy karke reload karne ke baad, ASA purane version par aaya. <code>show version</code> abhi bhi purani image file dikha raha tha. <code>show running-config boot</code> ne ek purani <code>boot system</code> line dikhayi jo pichhli image ki taraf point kar rahi thi. Engineer ne use hataya, nayi image ki line jodi, save kiya aur window ke dauraan reload kiya. Box naye version par boot hua.</p><p><b>Seekh:</b> boot order pehle <code>boot system</code> lines follow karta hai; reload se pehle hamesha unhe check karo aur save karo.</p></div>

<div class="iv"><p class="q">"Aap transparent mode kab use karoge, aur multiple context mode kab?"</p><p>Strong answer: transparent mode tab jab aapko existing subnet mein bina re-addressing ke firewall daalna ho, jaise legacy server farm ke aage; ASA bridge karta hai aur routing hop nahi hota. Multiple context tab jab ek physical firewall ko kai tenants ya departments ko alag policies aur administrators ke saath serve karna ho. Batao ki dono independent hain, firewall mode badalne se config clear hoti hai, aur multiple context mein feature aur licence limits hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Boot order: ROMMON, <code>disk0:</code> se image (<code>boot system</code> ke hisaab se), phir startup-config.</li>
<li><code>show version</code> software, image aur kaunsi config load hui, yeh batata hai.</li>
<li>Routed mode = layer 3 hop (default); transparent mode = bridge groups aur BVI wala layer 2 bridge.</li>
<li>Single context = ek firewall; multiple context = system space aur admin context ke saath kai virtual firewalls.</li>
<li><code>show firewall</code> aur <code>show mode</code> modes check karte hain; inhe badalna disruptive hai.</li>
</ul></div>
`}};export{e as default};