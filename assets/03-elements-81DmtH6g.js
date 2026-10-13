var e={id:`elements`,h:{en:`Elements: the named building blocks`,hi:`Elements: named building blocks`},body:{en:`
<p>When you write an address on a parcel, you do not write the full GPS position of the house. You write a name and a flat number, and the post office knows the rest. In the SMC, <b>elements</b> work the same way. Instead of typing 10.1.1.0/24 into every rule, you create an element called <code>net-staff</code> once. Rules use the name. If the address changes, you edit one element and every rule that uses it follows.</p>

<h3>The main element types</h3>
<table class="cmp"><tr><th>Element</th><th>Holds</th><th>Lab example</th></tr>
<tr><td><b>Host</b></td><td>One IP address</td><td><code>srv-web</code> = 172.16.20.20, <code>srv-smc</code> = 10.0.0.10</td></tr>
<tr><td><b>Network</b></td><td>An address and a prefix length</td><td><code>net-staff</code> = 10.1.1.0/24, <code>net-dmz</code> = 172.16.20.0/24</td></tr>
<tr><td><b>Address range</b></td><td>A first and a last address</td><td>A DHCP pool 10.1.1.100 to 10.1.1.200</td></tr>
<tr><td><b>Service</b></td><td>A protocol and a port or port range</td><td>TCP 8080 for an internal web app</td></tr>
<tr><td><b>Alias</b></td><td>A name whose value is different on each engine</td><td>"Local LAN" = net-staff on Pune, another network on Delhi</td></tr>
</table>
<p>The simulator also has time ranges and user groups; you meet them in later modules. Rules refer to elements by name, so a clean naming style pays off.</p>

<h3>Predefined elements</h3>
<p>The SMC comes with many <b>predefined elements</b>: common services such as HTTP, HTTPS, DNS (UDP), SSH and ICMP (ping), and the special service for engine-to-SMC contact (named <code>SMC contact</code> in the lab). Use them instead of recreating them. Predefined elements are part of the system, so treat them as read-only reference items. The exact list depends on the release; check the documentation for your NGFW version.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Rule uses elements by name">
<rect x="10" y="20" width="190" height="200" rx="10" fill="#bae6fd"/><text x="105" y="44" text-anchor="middle" class="svg-ink" font-size="14">Elements page</text>
<text x="105" y="75" text-anchor="middle" class="svg-ink" font-size="12">net-staff 10.1.1.0/24</text>
<text x="105" y="100" text-anchor="middle" class="svg-ink" font-size="12">net-dmz 172.16.20.0/24</text>
<text x="105" y="125" text-anchor="middle" class="svg-ink" font-size="12">srv-web 172.16.20.20</text>
<text x="105" y="150" text-anchor="middle" class="svg-ink" font-size="12">tcp-8080 TCP 8080</text>
<text x="105" y="190" text-anchor="middle" class="svg-muted" font-size="12">define once</text>
<rect x="250" y="20" width="190" height="200" rx="10" fill="#fde68a"/><text x="345" y="44" text-anchor="middle" class="svg-ink" font-size="14">Rule in Policies</text>
<text x="345" y="80" text-anchor="middle" class="svg-ink" font-size="12">src: net-staff</text>
<text x="345" y="105" text-anchor="middle" class="svg-ink" font-size="12">dst: srv-web</text>
<text x="345" y="130" text-anchor="middle" class="svg-ink" font-size="12">svc: tcp-8080</text>
<text x="345" y="155" text-anchor="middle" class="svg-ink" font-size="12">action: Allow</text>
<text x="345" y="190" text-anchor="middle" class="svg-muted" font-size="12">use by name</text>
<rect x="490" y="20" width="140" height="200" rx="10" fill="#bbf7d0"/><text x="560" y="44" text-anchor="middle" class="svg-ink" font-size="14">Engine</text>
<text x="560" y="90" text-anchor="middle" class="svg-ink" font-size="12">gets real</text>
<text x="560" y="110" text-anchor="middle" class="svg-ink" font-size="12">addresses</text>
<text x="560" y="130" text-anchor="middle" class="svg-ink" font-size="12">after install</text>
<line x1="200" y1="120" x2="250" y2="120" stroke="#64748b" stroke-width="2"/><line x1="440" y1="120" x2="490" y2="120" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Names in the SMC become real addresses and ports when the policy is compiled and installed.</p></div>

<h3>Aliases: one name, a different value per engine</h3>
<p>Suppose you write a template rule "allow the local LAN to the internet" for all branches. The local LAN is 10.1.1.0/24 in Pune, but a different network in Delhi. A normal network element holds one value. An <b>alias</b> holds a different value for each engine. You write the rule once with the alias; when the policy is installed on NK-PUNE-FW, the alias resolves to Pune's network, and on a Delhi engine it resolves to Delhi's. This is how one shared policy serves many branches. If an alias has no value for an engine, the install for that engine is blocked.</p>

<h3>Naming: a small habit with a big payoff</h3>
<p>Use a short, consistent pattern. In the lab we use a type prefix and a meaning: <code>net-</code> for networks, <code>srv-</code> for servers, <code>tcp-</code> for TCP services. Avoid names like "new network 2" or "test". In a year, nobody remembers what they meant. Put the purpose in the name, not the address, because the address may change but the purpose will not.</p>

<div class="eg"><p><b>Worked example.</b> Network Kings wants staff in Pune to reach an internal web application on WEB1 using TCP 8080. Steps in the console: on the Elements page create network <code>net-staff</code> 10.1.1.0/24, host <code>srv-web</code> 172.16.20.20 and service <code>tcp-8080</code> with protocol TCP and port 8080. On the Policies page, in a draft rule, put <code>net-staff</code> in Source, <code>srv-web</code> in Destination and <code>tcp-8080</code> in Service. Set the action to Allow. The rule means: staff PCs may open TCP 8080 on 172.16.20.20. Nothing happens on the engine yet. You still need to install.</p></div>

<h3>Common ways to build wrong elements</h3>
<pre class="out">net-staff   10.1.1.0/24     <span class="hl">correct: network address with prefix</span>
net-staff   10.1.1.10/24    <span class="hl">looks like a host with a mask: avoid</span>
srv-web     172.16.20.20/32 <span class="hl">host entered as network: use a Host element</span>
tcp-8080    UDP 8080        <span class="hl">wrong protocol: the app uses TCP</span></pre>

<h3>What a missing element does at install</h3>
<p>A rule can name an element that does not exist (for example a rule was copied in, or an element was deleted). The SMC cannot compile an unknown name. At Install, the validation step reports an <b>error</b>, and an error <b>blocks</b> the install: nothing changes on the engine, and the previous policy stays active. The same applies to an alias with no value for the engine you are installing. In chapter 6 you will see the difference between errors, which block, and warnings, which do not.</p>

<div class="warn"><p><b>Common mistakes.</b> Typing literal addresses into rules when an element exists. Creating two elements with the same meaning (<code>net-staff</code> and <code>staff-lan</code>) so that one gets updated and the other forgotten. Using the wrong protocol on a service. Deleting an element that a rule still uses.</p></div>
<div class="exam"><p><b>Exam trap.</b> An alias is not a second name for one value. It is one name with a different value per engine. And a network element needs the prefix length; a host does not.</p></div>

<div class="scn"><h4>The staff network that moved</h4><p>Network Kings renumbered the Pune Staff LAN from 10.1.1.0/24 to 10.1.5.0/24 after merging two floors. In an old setup that meant editing fourteen rules by hand and missing two. In the new setup an engineer changed the one element <code>net-staff</code> and installed. All fourteen rules followed. One rule was missed only because someone had typed 10.1.1.0/24 as a literal address; it was found in the logs when traffic from the new range was discarded.</p><p><b>Lesson:</b> elements make change safe, but only for rules that actually use them.</p></div>

<div class="iv"><p class="q">"What is an alias and when would you use it?"</p><p>Strong answer: an alias is a name that resolves to a different element or address per engine. You use it in shared templates and policies, for example "local LAN" or "local gateway", so one policy can be installed on many branches with each engine getting its own values. Mention that install is blocked if an engine has no value for the alias.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Elements are named objects: host, network, address range, service, alias and more.</li>
<li>Rules use names; real values are placed in the compiled policy at install.</li>
<li>Aliases hold a different value per engine; predefined elements cover common services.</li>
<li>Use a consistent naming pattern such as net-, srv-, tcp-.</li>
<li>A missing element or alias value is an install error and blocks the install.</li>
</ul></div>
`,hi:`
<p>Parcel par address likhte ho to ghar ki poori GPS position nahi likhte. Naam aur flat number likhte ho, baaki post office jaanta hai. SMC mein <b>elements</b> aise hi kaam karte hain. Har rule mein 10.1.1.0/24 type karne ke bajaye aap ek baar <code>net-staff</code> naam ka element banate ho. Rules naam use karte hain. Address badle to ek element edit karte ho aur use karne wale saare rules follow karte hain.</p>

<h3>Main element types</h3>
<table class="cmp"><tr><th>Element</th><th>Kya rakhta hai</th><th>Lab example</th></tr>
<tr><td><b>Host</b></td><td>Ek IP address</td><td><code>srv-web</code> = 172.16.20.20, <code>srv-smc</code> = 10.0.0.10</td></tr>
<tr><td><b>Network</b></td><td>Address aur prefix length</td><td><code>net-staff</code> = 10.1.1.0/24, <code>net-dmz</code> = 172.16.20.0/24</td></tr>
<tr><td><b>Address range</b></td><td>Pehla aur aakhri address</td><td>DHCP pool 10.1.1.100 se 10.1.1.200</td></tr>
<tr><td><b>Service</b></td><td>Protocol aur port ya port range</td><td>Internal web app ke liye TCP 8080</td></tr>
<tr><td><b>Alias</b></td><td>Aisa naam jiski value har engine par alag hoti hai</td><td>"Local LAN" = Pune par net-staff, Delhi par doosra network</td></tr>
</table>
<p>Simulator mein time ranges aur user groups bhi hain; unse aap aage ke modules mein milenge. Rules elements ko naam se refer karte hain, isliye clean naming style ka fayda milta hai.</p>

<h3>Predefined elements</h3>
<p>SMC ke saath kai <b>predefined elements</b> aate hain: common services jaise HTTP, HTTPS, DNS (UDP), SSH aur ICMP (ping), aur engine-to-SMC contact ki special service (lab mein <code>SMC contact</code> naam se). Inhe dobara banane ke bajaye use karo. Predefined elements system ka hissa hain, inhe read-only reference ki tarah treat karo. Exact list release par depend karti hai; apne NGFW version ki documentation check karo.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Rule elements ko naam se use karta hai">
<rect x="10" y="20" width="190" height="200" rx="10" fill="#bae6fd"/><text x="105" y="44" text-anchor="middle" class="svg-ink" font-size="14">Elements page</text>
<text x="105" y="75" text-anchor="middle" class="svg-ink" font-size="12">net-staff 10.1.1.0/24</text>
<text x="105" y="100" text-anchor="middle" class="svg-ink" font-size="12">net-dmz 172.16.20.0/24</text>
<text x="105" y="125" text-anchor="middle" class="svg-ink" font-size="12">srv-web 172.16.20.20</text>
<text x="105" y="150" text-anchor="middle" class="svg-ink" font-size="12">tcp-8080 TCP 8080</text>
<text x="105" y="190" text-anchor="middle" class="svg-muted" font-size="12">ek baar define</text>
<rect x="250" y="20" width="190" height="200" rx="10" fill="#fde68a"/><text x="345" y="44" text-anchor="middle" class="svg-ink" font-size="14">Policies mein rule</text>
<text x="345" y="80" text-anchor="middle" class="svg-ink" font-size="12">src: net-staff</text>
<text x="345" y="105" text-anchor="middle" class="svg-ink" font-size="12">dst: srv-web</text>
<text x="345" y="130" text-anchor="middle" class="svg-ink" font-size="12">svc: tcp-8080</text>
<text x="345" y="155" text-anchor="middle" class="svg-ink" font-size="12">action: Allow</text>
<text x="345" y="190" text-anchor="middle" class="svg-muted" font-size="12">naam se use</text>
<rect x="490" y="20" width="140" height="200" rx="10" fill="#bbf7d0"/><text x="560" y="44" text-anchor="middle" class="svg-ink" font-size="14">Engine</text>
<text x="560" y="90" text-anchor="middle" class="svg-ink" font-size="12">install ke</text>
<text x="560" y="110" text-anchor="middle" class="svg-ink" font-size="12">baad real</text>
<text x="560" y="130" text-anchor="middle" class="svg-ink" font-size="12">addresses milte hain</text>
<line x1="200" y1="120" x2="250" y2="120" stroke="#64748b" stroke-width="2"/><line x1="440" y1="120" x2="490" y2="120" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">SMC ke naam, policy compile aur install hone par real addresses aur ports ban jaate hain.</p></div>

<h3>Aliases: ek naam, har engine par alag value</h3>
<p>Maan lo aap sab branches ke liye template rule likhte ho "local LAN ko internet allow karo". Pune mein local LAN 10.1.1.0/24 hai, Delhi mein koi aur network. Normal network element ek hi value rakhta hai. <b>Alias</b> har engine ke liye alag value rakhta hai. Aap rule alias ke saath ek baar likhte ho; policy NK-PUNE-FW par install hone par alias Pune ke network mein resolve hota hai, aur Delhi engine par Delhi ke. Isi tarah ek shared policy kai branches ko serve karti hai. Agar kisi engine ke liye alias ki value nahi hai to us engine ka install block ho jata hai.</p>

<h3>Naming: chhoti aadat, bada fayda</h3>
<p>Chhota, consistent pattern use karo. Lab mein hum type prefix aur meaning use karte hain: networks ke liye <code>net-</code>, servers ke liye <code>srv-</code>, TCP services ke liye <code>tcp-</code>. "new network 2" ya "test" jaise naam avoid karo. Ek saal baad koi yaad nahi rakhega ki matlab kya tha. Naam mein purpose likho, address nahi, kyunki address badal sakta hai lekin purpose nahi.</p>

<div class="eg"><p><b>Worked example.</b> Network Kings chahta hai ki Pune ke staff WEB1 par internal web application TCP 8080 se reach karein. Console mein steps: Elements page par network <code>net-staff</code> 10.1.1.0/24, host <code>srv-web</code> 172.16.20.20 aur service <code>tcp-8080</code> (protocol TCP, port 8080) banao. Policies page par draft rule mein Source mein <code>net-staff</code>, Destination mein <code>srv-web</code>, Service mein <code>tcp-8080</code> rakho. Action Allow set karo. Rule ka matlab: staff PCs 172.16.20.20 par TCP 8080 khol sakte hain. Abhi engine par kuch nahi hua. Install abhi baaki hai.</p></div>

<h3>Galat elements banane ke common tareeke</h3>
<pre class="out">net-staff   10.1.1.0/24     <span class="hl">sahi: network address prefix ke saath</span>
net-staff   10.1.1.10/24    <span class="hl">host with mask jaisa dikhta hai: avoid</span>
srv-web     172.16.20.20/32 <span class="hl">host ko network bana diya: Host element use karo</span>
tcp-8080    UDP 8080        <span class="hl">galat protocol: app TCP use karti hai</span></pre>

<h3>Missing element install par kya karta hai</h3>
<p>Rule aise element ka naam le sakta hai jo exist nahi karta (rule copy hua, ya element delete ho gaya). SMC unknown naam compile nahi kar sakta. Install par validation step <b>error</b> report karta hai, aur error install ko <b>block</b> karta hai: engine par kuch nahi badalta, purani policy active rehti hai. Yahi hota hai jab jis engine par install kar rahe ho uske liye alias ki value nahi hai. Chapter 6 mein dekhoge ki errors block karte hain aur warnings nahi.</p>

<div class="warn"><p><b>Common mistakes.</b> Element hone par bhi rules mein literal addresses type karna. Ek hi matlab ke do elements (<code>net-staff</code> aur <code>staff-lan</code>) bana dena, ek update ho jaye aur doosra bhool jaye. Service par galat protocol. Aisa element delete karna jo rule abhi use kar raha hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Alias ek value ka doosra naam nahi hai. Yeh ek naam hai jiski har engine par alag value hoti hai. Aur network element ko prefix length chahiye; host ko nahi.</p></div>

<div class="scn"><h4>Staff network jo shift ho gaya</h4><p>Network Kings ne do floors merge karne ke baad Pune Staff LAN ko 10.1.1.0/24 se 10.1.5.0/24 renumber kiya. Purane setup mein chaudah rules haath se edit karne padte aur do miss ho jaate. Naye setup mein engineer ne ek element <code>net-staff</code> badla aur install kiya. Chaudah ke chaudah rules follow kar gaye. Ek rule isliye miss hua kyunki kisi ne 10.1.1.0/24 literal address type kiya tha; logs mein mila jab naye range ka traffic discard ho raha tha.</p><p><b>Lesson:</b> elements change ko safe banate hain, lekin sirf un rules ke liye jo sach mein unhe use karte hain.</p></div>

<div class="iv"><p class="q">"Alias kya hai aur kab use karoge?"</p><p>Strong answer: alias aisa naam hai jo har engine par alag element ya address mein resolve hota hai. Shared templates aur policies mein use karte hain, jaise "local LAN" ya "local gateway", taki ek policy kai branches par install ho aur har engine ko apni values mile. Bolo ki engine ke liye alias ki value na ho to install block ho jata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Elements named objects hain: host, network, address range, service, alias aur aur bhi.</li>
<li>Rules naam use karte hain; real values install par compiled policy mein aati hain.</li>
<li>Aliases har engine par alag value rakhte hain; predefined elements common services cover karte hain.</li>
<li>Consistent naming pattern use karo jaise net-, srv-, tcp-.</li>
<li>Missing element ya alias value install error hai aur install block karta hai.</li>
</ul></div>
`}};export{e as default};