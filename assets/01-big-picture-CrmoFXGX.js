var e={id:`big-picture`,h:{en:`Why Python? The big picture for network engineers`,hi:`Python kyun? Network engineers ke liye big picture`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to read a Python script line by line and predict what it prints, write small scripts that log in to routers and switches, turn <code>show</code> output into data, read and build valid JSON files, call the REST APIs of Catalyst Center and SD-WAN Manager and react to their status codes, and explain how Ansible, Puppet, Chef and SaltStack differ. You will also fix two broken scripts in the labs, exactly the way you would at work.</p>
<p><b>Prerequisites.</b> You have <b>never programmed</b>? Good, this module assumes nothing. You do need CCNA-level IOS skills: moving between EXEC and configuration mode, <code>show ip interface brief</code>, <code>show vlan brief</code>, and enabling SSH (hostname, domain name, RSA key, local user, <code>transport input ssh</code>). The CCNA automation module introduced REST, JSON and controllers; here we go one level deeper and actually write the code.</p>

<h3>Start with an analogy: a recipe and a tireless assistant</h3>
<p>Imagine you run a restaurant chain with 200 kitchens and you need to change the salt in one dish everywhere. You could visit every kitchen yourself. Or you could write one clear <b>recipe</b> and give it to an assistant who never gets tired, never skips a step and reports back exactly what he found in each kitchen. The assistant is not clever. He does precisely what the recipe says, in order, every time.</p>
<p>A <b>Python script</b> is that recipe. The <b>Python interpreter</b> is the assistant: a program that reads your script one line at a time and carries out each instruction. The kitchens are your network devices. If the recipe is wrong, the assistant repeats the mistake 200 times, which is why reading scripts carefully is as important as writing them.</p>

<h3>Why network engineers need it</h3>
<ul>
<li><b>Consistency.</b> The same template is applied on every device. No typo at 2 a.m. on switch number 137.</li>
<li><b>Speed.</b> An audit of 200 switches takes minutes instead of a day.</li>
<li><b>Data instead of screens.</b> <code>show</code> output becomes lists and dictionaries you can compare, store as JSON, and feed to reports or monitoring.</li>
<li><b>Safer change.</b> A script can check the state before a change, apply it, and verify afterwards, and it logs everything it did.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Changing the NTP server on 180 access switches by hand: about 3 minutes per switch (log in, configure, verify, save) = 540 minutes, or 9 hours, plus the risk of missing some. A script that logs in to each switch in turn takes about 4 seconds per switch = 12 minutes, and it prints a line for every switch that failed. Writing and testing the script takes perhaps an hour, once. Next month you reuse it.</p></div>

<h3>Four ways code talks to the network</h3>
<p>Every automation you will meet uses one of these paths:</p>
<ol>
<li><b>SSH and the CLI.</b> The script logs in exactly like you do, sends <code>show</code> and configuration commands, and reads the text that comes back. Libraries such as <b>Netmiko</b> make this easy. It works on every old device, but text output is meant for humans, so the script must <b>parse</b> it.</li>
<li><b>Device APIs.</b> Modern IOS XE speaks <b>NETCONF</b> and <b>RESTCONF</b>, which exchange structured data (XML or JSON) described by <b>YANG</b> models. That is the next module; here you meet only the Python side.</li>
<li><b>Controller APIs.</b> Catalyst Center and SD-WAN Manager manage hundreds of devices and offer a <b>northbound REST API</b>. Your script asks the controller, and the controller talks to the devices.</li>
<li><b>Orchestration tools.</b> Ansible, Puppet, Chef and SaltStack wrap all of the above in a framework, so you describe the desired state instead of writing every step.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="How a script reaches the network">
<rect x="20" y="100" width="160" height="56" rx="8" fill="#bbf7d0"/><text x="100" y="124" text-anchor="middle" class="svg-ink" font-size="14">AUTO host</text><text x="100" y="143" text-anchor="middle" class="svg-muted" font-size="12">Python 3 script</text>
<rect x="440" y="16" width="180" height="50" rx="8" fill="#bae6fd"/><text x="530" y="38" text-anchor="middle" class="svg-ink" font-size="14">R1, R2, R3</text><text x="530" y="56" text-anchor="middle" class="svg-muted" font-size="12">CLI over SSH (Netmiko)</text>
<rect x="440" y="104" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="530" y="126" text-anchor="middle" class="svg-ink" font-size="14">Catalyst Center</text><text x="530" y="144" text-anchor="middle" class="svg-muted" font-size="12">REST API, JSON</text>
<rect x="440" y="192" width="180" height="50" rx="8" fill="#fde68a"/><text x="530" y="214" text-anchor="middle" class="svg-ink" font-size="14">SD-WAN Manager</text><text x="530" y="232" text-anchor="middle" class="svg-muted" font-size="12">REST API, JSON</text>
<line x1="180" y1="120" x2="440" y2="41" stroke="#64748b" stroke-width="2"/><text x="300" y="70" text-anchor="middle" class="svg-accent" font-size="12">TCP 22</text>
<line x1="180" y1="128" x2="440" y2="129" stroke="#64748b" stroke-width="2"/><text x="310" y="121" text-anchor="middle" class="svg-accent" font-size="12">HTTPS 443</text>
<line x1="180" y1="136" x2="440" y2="217" stroke="#64748b" stroke-width="2"/><text x="300" y="196" text-anchor="middle" class="svg-accent" font-size="12">HTTPS 443</text>
</svg><p class="cap">One script, three targets: devices directly over SSH, or controllers over their REST APIs.</p></div>

<h3>What the ENCOR exam actually asks</h3>
<table class="cmp"><tr><th>Blueprint item</th><th>What it means for you</th><th>Chapters</th></tr>
<tr><td>6.1 Interpret basic Python components and scripts</td><td>Read a snippet and say what it prints or does</td><td>2 to 7, 11</td></tr>
<tr><td>6.2 Construct valid JSON-encoded files</td><td>Spot and fix invalid JSON, build it by hand</td><td>8</td></tr>
<tr><td>6.4 Describe APIs for Catalyst Center and SD-WAN Manager</td><td>Token or session login, typical endpoints</td><td>9</td></tr>
<tr><td>6.5 Interpret REST response codes and payloads</td><td>200, 201, 202, 204, 400, 401, 403, 404, 500</td><td>9</td></tr>
<tr><td>6.7 Compare agent vs agentless orchestration tools</td><td>Ansible, Puppet, Chef, SaltStack</td><td>10</td></tr>
</table>
<p>YANG, NETCONF and RESTCONF (6.3 and the RESTCONF part of 6.5) are in the next module; EEM applets (6.6) have their own module.</p>

<h3>The lab network</h3>
<p>In the first lab an automation host called <b>AUTO</b> (10.99.0.100) sits on a management switch with <b>R1, R2 and R3</b> at 10.99.0.1, .2 and .3. Every router has SSH enabled and a local user <code>netops</code> with password <code>NK@2026</code>. In the second lab AUTO reaches two access switches, <b>ACC-SW1</b> (10.99.0.11) and <b>ACC-SW2</b> (10.99.0.12). You will use those names throughout the module.</p>

<div class="warn"><p><b>Common mistake.</b> Copying a script from a forum and running it against production because "it worked for someone". A script repeats its bug on every device. Always read it, run it against one lab device first, and understand every line that changes configuration.</p></div>

<div class="exam"><p><b>Exam trap.</b> ENCOR does not ask you to write long programs. It shows a short snippet or a JSON document and asks what it prints, which line is wrong, or what a status code means. Precision on small details (a missing colon, a trailing comma, index 0 versus 1) wins the marks.</p></div>

<div class="scn"><h4>The NTP change that missed seven switches</h4><p>A campus team changed the NTP server on 180 access switches by hand over two nights. A month later, log timestamps from seven switches did not match the others and a security investigation stalled. The seven had been skipped. The team wrote a 30-line script that logged in to every switch, ran <code>show running-config | include ntp server</code>, and printed any switch that still had the old server. It found the seven in under a minute, fixed them, and is now run every week as an audit.</p><p><b>Lesson:</b> the biggest early win of Python is not writing configuration, it is checking configuration everywhere, quickly and the same way every time.</p></div>

<div class="iv"><p class="q">"We already have Catalyst Center. Why should a network engineer learn Python?"</p><p>Strong answer: controllers cover common workflows, but every network has gaps: older devices outside the controller, one-off audits, reports that join data from several systems, and integration with ticketing or monitoring. Python lets you call the controller's own REST API, reach devices directly over SSH or NETCONF, and glue the results together. Mention that you start with read-only scripts and test in a lab before touching production.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A script is a recipe; the interpreter follows it exactly, including its mistakes.</li>
<li>Automation gives consistency, speed, structured data and safer, verified change.</li>
<li>Code reaches the network over SSH/CLI, device APIs, controller REST APIs, or orchestration tools.</li>
<li>ENCOR tests reading Python, building valid JSON, controller APIs and status codes, and orchestration tool differences.</li>
<li>Lab names to remember: AUTO, R1 to R3 on 10.99.0.0/24, ACC-SW1 and ACC-SW2, user netops.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap ek Python script ko line by line padh kar bata sakoge ki woh kya print karega, chhote scripts likh sakoge jo routers aur switches par login karein, <code>show</code> output ko data mein badal sakoge, valid JSON files padh aur bana sakoge, Catalyst Center aur SD-WAN Manager ki REST APIs call karke unke status codes par react kar sakoge, aur samjha sakoge ki Ansible, Puppet, Chef aur SaltStack mein kya fark hai. Labs mein aap do toote hue scripts bhi fix karoge, bilkul waise hi jaise office mein karte.</p>
<p><b>Prerequisites.</b> Aapne <b>kabhi programming nahi ki</b>? Koi baat nahi, yeh module kuch bhi assume nahi karta. Haan, CCNA-level IOS skills chahiye: EXEC aur configuration mode ke beech aana-jaana, <code>show ip interface brief</code>, <code>show vlan brief</code>, aur SSH enable karna (hostname, domain name, RSA key, local user, <code>transport input ssh</code>). CCNA automation module ne REST, JSON aur controllers introduce kiye the; yahan hum ek level aur gehre jaate hain aur sach mein code likhte hain.</p>

<h3>Ek analogy se shuru karo: recipe aur kabhi na thakne wala assistant</h3>
<p>Socho aap 200 kitchens wali restaurant chain chalate ho aur ek dish ka namak har jagah badalna hai. Aap khud har kitchen jaa sakte ho. Ya ek saaf <b>recipe</b> likh kar ek aise assistant ko de sakte ho jo kabhi thakta nahi, kabhi step skip nahi karta, aur har kitchen mein kya mila uski exact report deta hai. Assistant smart nahi hai. Woh bilkul wahi karta hai jo recipe kehti hai, order mein, har baar.</p>
<p><b>Python script</b> woh recipe hai. <b>Python interpreter</b> woh assistant hai: ek program jo aapka script ek line ek baar padhta hai aur har instruction execute karta hai. Kitchens aapke network devices hain. Agar recipe galat hai, to assistant woh galti 200 baar dohrata hai, isliye scripts dhyan se padhna utna hi zaroori hai jitna likhna.</p>

<h3>Network engineers ko iski zaroorat kyun hai</h3>
<ul>
<li><b>Consistency.</b> Har device par same template lagta hai. Raat 2 baje switch number 137 par typo nahi.</li>
<li><b>Speed.</b> 200 switches ka audit ek din ki jagah minutes mein.</li>
<li><b>Screens ki jagah data.</b> <code>show</code> output lists aur dictionaries ban jaata hai jinhe aap compare kar sakte ho, JSON mein store kar sakte ho, aur reports ya monitoring ko de sakte ho.</li>
<li><b>Safer change.</b> Script change se pehle state check kar sakta hai, change laga sakta hai, baad mein verify kar sakta hai, aur jo kuch kiya sab log karta hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> 180 access switches par haath se NTP server badalna: har switch par lagbhag 3 minute (login, configure, verify, save) = 540 minute, yaani 9 ghante, plus kuch chhoot jaane ka risk. Ek script jo har switch par baari baari login kare, har switch par lagbhag 4 second leta hai = 12 minute, aur har fail hue switch ki ek line print karta hai. Script likhne aur test karne mein shayad ek ghanta lagta hai, sirf ek baar. Agle mahine aap use dobara use karte ho.</p></div>

<h3>Code network se baat karne ke chaar tarike</h3>
<p>Aap jo bhi automation dekhoge, woh inme se ek path use karti hai:</p>
<ol>
<li><b>SSH aur CLI.</b> Script bilkul aapki tarah login karta hai, <code>show</code> aur configuration commands bhejta hai, aur wapas aaya text padhta hai. <b>Netmiko</b> jaisi libraries ise aasaan banati hain. Yeh har purane device par chalta hai, par text output insaano ke liye bana hai, isliye script ko use <b>parse</b> karna padta hai.</li>
<li><b>Device APIs.</b> Modern IOS XE <b>NETCONF</b> aur <b>RESTCONF</b> bolta hai, jo structured data (XML ya JSON) exchange karte hain jise <b>YANG</b> models describe karte hain. Woh agla module hai; yahan aap sirf Python wala hissa dekhoge.</li>
<li><b>Controller APIs.</b> Catalyst Center aur SD-WAN Manager sainkdon devices manage karte hain aur <b>northbound REST API</b> dete hain. Aapka script controller se poochta hai, aur controller devices se baat karta hai.</li>
<li><b>Orchestration tools.</b> Ansible, Puppet, Chef aur SaltStack upar ki sab cheezon ko ek framework mein lapet dete hain, taaki aap har step likhne ki jagah desired state describe karo.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Script network tak kaise pahunchta hai">
<rect x="20" y="100" width="160" height="56" rx="8" fill="#bbf7d0"/><text x="100" y="124" text-anchor="middle" class="svg-ink" font-size="14">AUTO host</text><text x="100" y="143" text-anchor="middle" class="svg-muted" font-size="12">Python 3 script</text>
<rect x="440" y="16" width="180" height="50" rx="8" fill="#bae6fd"/><text x="530" y="38" text-anchor="middle" class="svg-ink" font-size="14">R1, R2, R3</text><text x="530" y="56" text-anchor="middle" class="svg-muted" font-size="12">SSH par CLI (Netmiko)</text>
<rect x="440" y="104" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="530" y="126" text-anchor="middle" class="svg-ink" font-size="14">Catalyst Center</text><text x="530" y="144" text-anchor="middle" class="svg-muted" font-size="12">REST API, JSON</text>
<rect x="440" y="192" width="180" height="50" rx="8" fill="#fde68a"/><text x="530" y="214" text-anchor="middle" class="svg-ink" font-size="14">SD-WAN Manager</text><text x="530" y="232" text-anchor="middle" class="svg-muted" font-size="12">REST API, JSON</text>
<line x1="180" y1="120" x2="440" y2="41" stroke="#64748b" stroke-width="2"/><text x="300" y="70" text-anchor="middle" class="svg-accent" font-size="12">TCP 22</text>
<line x1="180" y1="128" x2="440" y2="129" stroke="#64748b" stroke-width="2"/><text x="310" y="121" text-anchor="middle" class="svg-accent" font-size="12">HTTPS 443</text>
<line x1="180" y1="136" x2="440" y2="217" stroke="#64748b" stroke-width="2"/><text x="300" y="196" text-anchor="middle" class="svg-accent" font-size="12">HTTPS 443</text>
</svg><p class="cap">Ek script, teen targets: devices seedhe SSH par, ya controllers unki REST APIs par.</p></div>

<h3>ENCOR exam asal mein kya poochta hai</h3>
<table class="cmp"><tr><th>Blueprint item</th><th>Aapke liye matlab</th><th>Chapters</th></tr>
<tr><td>6.1 Basic Python components aur scripts interpret karo</td><td>Snippet padh kar batao woh kya print ya kya karta hai</td><td>2 se 7, 11</td></tr>
<tr><td>6.2 Valid JSON-encoded files construct karo</td><td>Invalid JSON pakdo aur fix karo, haath se banao</td><td>8</td></tr>
<tr><td>6.4 Catalyst Center aur SD-WAN Manager ki APIs describe karo</td><td>Token ya session login, typical endpoints</td><td>9</td></tr>
<tr><td>6.5 REST response codes aur payloads interpret karo</td><td>200, 201, 202, 204, 400, 401, 403, 404, 500</td><td>9</td></tr>
<tr><td>6.7 Agent vs agentless orchestration tools compare karo</td><td>Ansible, Puppet, Chef, SaltStack</td><td>10</td></tr>
</table>
<p>YANG, NETCONF aur RESTCONF (6.3 aur 6.5 ka RESTCONF hissa) agle module mein hain; EEM applets (6.6) ka apna module hai.</p>

<h3>Lab network</h3>
<p>Pehle lab mein <b>AUTO</b> naam ka automation host (10.99.0.100) ek management switch par hai, saath mein <b>R1, R2 aur R3</b> 10.99.0.1, .2 aur .3 par. Har router par SSH enabled hai aur local user <code>netops</code> password <code>NK@2026</code> ke saath. Doosre lab mein AUTO do access switches tak pahunchta hai, <b>ACC-SW1</b> (10.99.0.11) aur <b>ACC-SW2</b> (10.99.0.12). Yeh naam poore module mein use honge.</p>

<div class="warn"><p><b>Common galti.</b> Forum se script copy karke production par chala dena kyunki "kisi ke liye chal gaya tha". Script apna bug har device par dohrata hai. Hamesha use padho, pehle ek lab device par chalao, aur configuration badalne wali har line samjho.</p></div>

<div class="exam"><p><b>Exam trap.</b> ENCOR lambe programs likhne ko nahi kehta. Woh ek chhota snippet ya JSON document dikhata hai aur poochta hai woh kya print karega, kaunsi line galat hai, ya status code ka matlab kya hai. Chhoti details par precision (missing colon, trailing comma, index 0 vs 1) se marks milte hain.</p></div>

<div class="scn"><h4>NTP change jisme saat switches chhoot gaye</h4><p>Ek campus team ne do raaton mein 180 access switches par haath se NTP server badla. Ek mahine baad saat switches ke log timestamps baaki se match nahi kar rahe the aur ek security investigation atak gayi. Woh saat skip ho gaye the. Team ne 30 line ka script likha jo har switch par login karke <code>show running-config | include ntp server</code> chalata aur jis switch par abhi bhi purana server tha use print karta. Usne ek minute se kam mein saaton dhoondh liye, unhe fix kiya, aur ab yeh har hafte audit ki tarah chalta hai.</p><p><b>Seekh:</b> Python ki sabse badi shuruaati jeet configuration likhna nahi, balki har jagah configuration check karna hai, jaldi aur har baar same tareeke se.</p></div>

<div class="iv"><p class="q">"Hamare paas already Catalyst Center hai. Network engineer Python kyun seekhe?"</p><p>Strong answer: controllers common workflows cover karte hain, par har network mein gaps hote hain: controller se bahar purane devices, one-off audits, reports jo kai systems ka data jodti hain, aur ticketing ya monitoring ke saath integration. Python se aap controller ki apni REST API call kar sakte ho, devices tak seedha SSH ya NETCONF se pahunch sakte ho, aur results ko jod sakte ho. Batao ki aap read-only scripts se shuru karte ho aur production chhoone se pehle lab mein test karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Script ek recipe hai; interpreter use bilkul follow karta hai, uski galtiyon samet.</li>
<li>Automation consistency, speed, structured data aur safer, verified change deta hai.</li>
<li>Code network tak SSH/CLI, device APIs, controller REST APIs, ya orchestration tools se pahunchta hai.</li>
<li>ENCOR Python padhna, valid JSON banana, controller APIs aur status codes, aur orchestration tools ka fark test karta hai.</li>
<li>Yaad rakhne wale lab naam: AUTO, 10.99.0.0/24 par R1 se R3, ACC-SW1 aur ACC-SW2, user netops.</li>
</ul></div>
`}};export{e as default};