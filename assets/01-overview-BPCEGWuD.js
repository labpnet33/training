var e={id:`overview`,h:{en:`From the box to the network: what you will learn`,hi:`Box se network tak: aap kya seekhoge`},body:{en:`
<p><b>What you will learn in this module.</b> You will take a Junos device from factory defaults to a working, secured device: the first commit and root password, system basics, user accounts and login classes, remote authentication, interfaces and units, and configuration groups. These are the Configuration Basics objectives of JNCIA-Junos (JN0-106).</p>
<p><b>Prerequisites.</b> You should be comfortable with the previous module: configuration mode, <code>set</code>, <code>show | compare</code>, <code>commit</code> and <code>rollback</code>. If you know what an IP address and a subnet are, nothing else is needed.</p>

<h3>Analogy: setting up a new smartphone</h3>
<p>When you buy a phone it works, but only in a generic way. You set a passcode, pick a name, join Wi-Fi, create accounts for family members with limited rights, and organise settings you want the same everywhere. A Junos device is identical. It ships with a small <b>factory-default configuration</b>, and your job is the <b>initial setup</b>: make it yours, make it reachable, make it safe, make it consistent.</p>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Initial setup stages">
<rect x="8" y="50" width="86" height="60" rx="8" fill="#e2e8f0"/><text x="51" y="76" text-anchor="middle" class="svg-ink" font-size="12">Factory</text><text x="51" y="94" text-anchor="middle" class="svg-muted" font-size="11">default</text>
<rect x="108" y="50" width="86" height="60" rx="8" fill="#fde68a"/><text x="151" y="76" text-anchor="middle" class="svg-ink" font-size="12">Root</text><text x="151" y="94" text-anchor="middle" class="svg-muted" font-size="11">password</text>
<rect x="208" y="50" width="86" height="60" rx="8" fill="#bae6fd"/><text x="251" y="76" text-anchor="middle" class="svg-ink" font-size="12">System</text><text x="251" y="94" text-anchor="middle" class="svg-muted" font-size="11">basics</text>
<rect x="308" y="50" width="86" height="60" rx="8" fill="#bbf7d0"/><text x="351" y="76" text-anchor="middle" class="svg-ink" font-size="12">Users +</text><text x="351" y="94" text-anchor="middle" class="svg-muted" font-size="11">classes</text>
<rect x="408" y="50" width="100" height="60" rx="8" fill="#ddd6fe"/><text x="458" y="76" text-anchor="middle" class="svg-ink" font-size="12">Interfaces</text><text x="458" y="94" text-anchor="middle" class="svg-muted" font-size="11">units, families</text>
<rect x="522" y="50" width="110" height="60" rx="8" fill="#fed7aa"/><text x="577" y="76" text-anchor="middle" class="svg-ink" font-size="12">Groups</text><text x="577" y="94" text-anchor="middle" class="svg-muted" font-size="11">standards</text>
<g stroke="#64748b" stroke-width="2"><line x1="94" y1="80" x2="108" y2="80"/><line x1="194" y1="80" x2="208" y2="80"/><line x1="294" y1="80" x2="308" y2="80"/><line x1="394" y1="80" x2="408" y2="80"/><line x1="508" y1="80" x2="522" y2="80"/></g>
</svg><p class="cap">The six stages of initial setup, one chapter each (with a troubleshooting and a summary chapter).</p></div>

<h3>Chapter map</h3>
<ul>
<li><b>Chapter 2</b>: why a factory-default box refuses its first commit, and how to fix it.</li>
<li><b>Chapter 3</b>: host name, management address, services, banners and password storage.</li>
<li><b>Chapter 4</b>: user accounts and login classes (operator, read-only, custom).</li>
<li><b>Chapter 5</b>: local, RADIUS and TACACS+ authentication and their order.</li>
<li><b>Chapter 6</b>: physical interfaces, logical units and protocol families.</li>
<li><b>Chapter 7</b>: configuration groups, wildcards and inheritance.</li>
<li><b>Chapter 8</b>: a troubleshooting workflow using the real lab tickets. <b>Chapter 9</b>: exam checklist.</li>
</ul>

<h3>The devices you will meet</h3>
<p>The labs use <b>R1</b> (a Junos router), sometimes a second router <b>R2</b> as a jump host, and test machines <b>PC1</b> and <b>SRV</b>. For example, the Pune edge router has a LAN at 172.16.10.0/24, the Hyderabad core uses 10.40.0.0/30 to its jump router, and the Bengaluru distribution router uses 10.50.12.0/30, 10.50.1.0/24 and 10.50.2.0/24. You will see the exact commands again in the walkthroughs.</p>

<div class="eg"><p><b>Worked example.</b> A branch router arrives. Your checklist: (1) log in as root on the console, (2) set the root password, (3) set the host name and management address, (4) create named accounts and turn on SSH, (5) address the interfaces, (6) apply the company standards with groups, (7) commit with a comment and save a rescue configuration. Seven steps, the same on every device.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Leaving a device on the shared root account. Nobody can tell who made a change, a leaked password affects everybody, and auditors will fail the network. Named accounts with the right login class are not optional.</p></div>
<div class="exam"><p><b>Exam trap.</b> The factory-default device cannot commit until a root password exists. Questions often describe a failed first commit; the answer is <code>system root-authentication</code>.</p></div>

<div class="scn"><h4>The router that arrived with a password on a sticky note</h4><p>A vendor shipped ten routers with the same temporary password written on a note inside the box. A new engineer racked them all and never changed it. Six months later a scan of the management network found all ten still using the temporary password. The team re-did the initial setup with unique named accounts and RADIUS in a weekend.</p><p><b>Lesson:</b> initial setup is a security task, not just a connectivity task.</p></div>

<div class="iv"><p class="q">"Walk me through bringing up a brand-new Junos router."</p><p>I connect to the console as root, enter configuration mode, set the root password (the first commit fails without it), set the host name, management interface address and default route, enable SSH, create named users with suitable login classes, configure the data interfaces, apply standard configuration groups, commit with a comment, and save a rescue configuration.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A factory-default Junos device is usable only after a root password is set.</li>
<li>Initial setup means identity, reachability, security and consistency.</li>
<li>Users belong to login classes that limit commands.</li>
<li>Interfaces have physical properties and logical units with families.</li>
<li>Configuration groups keep common settings in one place.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap Junos device ko factory defaults se working, secured device tak le jaoge: pehla commit aur root password, system basics, user accounts aur login classes, remote authentication, interfaces aur units, aur configuration groups. Yeh JNCIA-Junos (JN0-106) ke Configuration Basics objectives hain.</p>
<p><b>Prerequisites.</b> Pichle module mein comfortable hona chahiye: configuration mode, <code>set</code>, <code>show | compare</code>, <code>commit</code> aur <code>rollback</code>. Agar aap jaante ho ki IP address aur subnet kya hain to aur kuch nahi chahiye.</p>

<h3>Analogy: naya smartphone set up karna</h3>
<p>Naya phone kharidte ho to woh chalta hai, lekin generic tareeke se. Aap passcode lagate ho, naam chunte ho, Wi-Fi join karte ho, family members ke limited rights wale accounts banate ho, aur woh settings organise karte ho jo har jagah same chahiye. Junos device bilkul aisa hi hai. Woh ek chhoti <b>factory-default configuration</b> ke saath aata hai, aur aapka kaam hai <b>initial setup</b>: use apna banao, reachable banao, safe banao, consistent banao.</p>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Initial setup stages">
<rect x="8" y="50" width="86" height="60" rx="8" fill="#e2e8f0"/><text x="51" y="76" text-anchor="middle" class="svg-ink" font-size="12">Factory</text><text x="51" y="94" text-anchor="middle" class="svg-muted" font-size="11">default</text>
<rect x="108" y="50" width="86" height="60" rx="8" fill="#fde68a"/><text x="151" y="76" text-anchor="middle" class="svg-ink" font-size="12">Root</text><text x="151" y="94" text-anchor="middle" class="svg-muted" font-size="11">password</text>
<rect x="208" y="50" width="86" height="60" rx="8" fill="#bae6fd"/><text x="251" y="76" text-anchor="middle" class="svg-ink" font-size="12">System</text><text x="251" y="94" text-anchor="middle" class="svg-muted" font-size="11">basics</text>
<rect x="308" y="50" width="86" height="60" rx="8" fill="#bbf7d0"/><text x="351" y="76" text-anchor="middle" class="svg-ink" font-size="12">Users +</text><text x="351" y="94" text-anchor="middle" class="svg-muted" font-size="11">classes</text>
<rect x="408" y="50" width="100" height="60" rx="8" fill="#ddd6fe"/><text x="458" y="76" text-anchor="middle" class="svg-ink" font-size="12">Interfaces</text><text x="458" y="94" text-anchor="middle" class="svg-muted" font-size="11">units, families</text>
<rect x="522" y="50" width="110" height="60" rx="8" fill="#fed7aa"/><text x="577" y="76" text-anchor="middle" class="svg-ink" font-size="12">Groups</text><text x="577" y="94" text-anchor="middle" class="svg-muted" font-size="11">standards</text>
<g stroke="#64748b" stroke-width="2"><line x1="94" y1="80" x2="108" y2="80"/><line x1="194" y1="80" x2="208" y2="80"/><line x1="294" y1="80" x2="308" y2="80"/><line x1="394" y1="80" x2="408" y2="80"/><line x1="508" y1="80" x2="522" y2="80"/></g>
</svg><p class="cap">Initial setup ke chhe stages, har ek ka ek chapter (saath mein troubleshooting aur summary chapter).</p></div>

<h3>Chapter map</h3>
<ul>
<li><b>Chapter 2</b>: factory-default box pehla commit kyun refuse karta hai, aur theek kaise karein.</li>
<li><b>Chapter 3</b>: host name, management address, services, banners aur password storage.</li>
<li><b>Chapter 4</b>: user accounts aur login classes (operator, read-only, custom).</li>
<li><b>Chapter 5</b>: local, RADIUS aur TACACS+ authentication aur unka order.</li>
<li><b>Chapter 6</b>: physical interfaces, logical units aur protocol families.</li>
<li><b>Chapter 7</b>: configuration groups, wildcards aur inheritance.</li>
<li><b>Chapter 8</b>: real lab tickets ke saath troubleshooting workflow. <b>Chapter 9</b>: exam checklist.</li>
</ul>

<h3>Jin devices se aap milenge</h3>
<p>Labs mein <b>R1</b> (Junos router), kabhi-kabhi jump host ke roop mein doosra router <b>R2</b>, aur test machines <b>PC1</b> aur <b>SRV</b> use hote hain. Jaise Pune edge router ka LAN 172.16.10.0/24 hai, Hyderabad core apne jump router tak 10.40.0.0/30 use karta hai, aur Bengaluru distribution router 10.50.12.0/30, 10.50.1.0/24 aur 10.50.2.0/24 use karta hai. Exact commands walkthroughs mein dobara dikhenge.</p>

<div class="eg"><p><b>Worked example.</b> Branch router aaya. Aapki checklist: (1) console par root se login, (2) root password set, (3) host name aur management address set, (4) named accounts banao aur SSH on karo, (5) interfaces address karo, (6) groups se company standards lagao, (7) comment ke saath commit karo aur rescue configuration save karo. Saat steps, har device par same.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Device ko shared root account par chhod dena. Koi nahi bata sakta ki change kisne kiya, leak hua password sab par asar karta hai, aur auditors network fail kar denge. Sahi login class wale named accounts optional nahi hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Factory-default device root password ke bina commit nahi kar sakta. Sawaal aksar failed first commit describe karte hain; jawab <code>system root-authentication</code> hota hai.</p></div>

<div class="scn"><h4>Woh router jo sticky note par password ke saath aaya</h4><p>Ek vendor ne das routers ek hi temporary password ke saath bheje jo box ke andar note par likha tha. Naye engineer ne sab rack kiye aur password kabhi nahi badla. Chhe mahine baad management network ke scan mein paaya gaya ki saare das abhi bhi temporary password use kar rahe hain. Team ne ek weekend mein unique named accounts aur RADIUS ke saath initial setup dobara kiya.</p><p><b>Lesson:</b> initial setup security ka kaam hai, sirf connectivity ka nahi.</p></div>

<div class="iv"><p class="q">"Naye Junos router ko bring up karne ka process batao."</p><p>Main console par root se connect hota hoon, configuration mode mein jaata hoon, root password set karta hoon (iske bina pehla commit fail hota hai), host name, management interface address aur default route set karta hoon, SSH enable karta hoon, suitable login classes ke saath named users banata hoon, data interfaces configure karta hoon, standard configuration groups apply karta hoon, comment ke saath commit karta hoon, aur rescue configuration save karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Factory-default Junos device root password set hone ke baad hi usable hai.</li>
<li>Initial setup ka matlab identity, reachability, security aur consistency.</li>
<li>Users login classes mein hote hain jo commands limit karti hain.</li>
<li>Interfaces ki physical properties aur families wali logical units hoti hain.</li>
<li>Configuration groups common settings ek jagah rakhte hain.</li>
</ul></div>
`}};export{e as default};