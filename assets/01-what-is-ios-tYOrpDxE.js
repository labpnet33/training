var e={id:`what-is-ios`,h:{en:`What you will learn, and what Cisco IOS is`,hi:`Aap kya seekhoge, aur Cisco IOS kya hai`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to connect to a brand-new Cisco switch or router, move confidently between its command modes, use the built-in help instead of memorising everything, give the device a name, protect it with passwords, put IP addresses on its interfaces, check your work with <code>show</code> commands and save the result so it survives a reboot. You will also know what happens when a device boots, where its configuration lives, and how to troubleshoot the classic first-day problem: "I cannot ping my router".</p>
<p><b>Prerequisites.</b> You should have finished the <i>Networking from absolute zero</i> module, so you know what a switch, a router, an IP address and a subnet mask are, and why a PC needs a default gateway. You do not need any Cisco experience. Every command in this module is explained the first time it appears, and the three labs let you practise each one on a simulated switch and router.</p>

<h3>Start with an analogy: IOS is the reception desk of a secure office building</h3>
<p>Imagine a large office building. At the front there is a reception desk. A visitor can ask the receptionist simple questions ("what floor is accounts on?") but cannot change anything. An employee who shows a badge can walk further inside and look at every file. A manager with a master key can enter the control room and change how the whole building works: rename meeting rooms, change door codes, rewire the lifts. Inside the control room there are smaller rooms for specific jobs: one for the lifts, one for the doors, one for the lights.</p>
<p><b>Cisco IOS</b> (Internetwork Operating System) works the same way. It is the operating system that runs on Cisco routers and switches, and you talk to it through a <b>command-line interface (CLI)</b>. The CLI has levels: a visitor level where you can only look (<b>user EXEC</b>), an employee level where you can see everything and run tests (<b>privileged EXEC</b>), a control room where you change the configuration (<b>global configuration</b>), and small rooms for one interface or one line (<b>sub-modes</b>). The prompt at the end of the line tells you which room you are standing in.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="IOS access levels as rooms">
<rect x="10" y="20" width="140" height="170" rx="10" fill="#e2e8f0"/><text x="80" y="50" text-anchor="middle" class="svg-ink" font-size="14">Reception</text><text x="80" y="75" text-anchor="middle" class="svg-accent" font-size="14">Router&gt;</text><text x="80" y="100" text-anchor="middle" class="svg-muted" font-size="12">user EXEC</text><text x="80" y="120" text-anchor="middle" class="svg-muted" font-size="12">look only</text>
<rect x="170" y="20" width="140" height="170" rx="10" fill="#bae6fd"/><text x="240" y="50" text-anchor="middle" class="svg-ink" font-size="14">Staff area</text><text x="240" y="75" text-anchor="middle" class="svg-accent" font-size="14">Router#</text><text x="240" y="100" text-anchor="middle" class="svg-muted" font-size="12">privileged EXEC</text><text x="240" y="120" text-anchor="middle" class="svg-muted" font-size="12">see all, test, save</text>
<rect x="330" y="20" width="140" height="170" rx="10" fill="#fde68a"/><text x="400" y="50" text-anchor="middle" class="svg-ink" font-size="14">Control room</text><text x="400" y="75" text-anchor="middle" class="svg-accent" font-size="13">Router(config)#</text><text x="400" y="100" text-anchor="middle" class="svg-muted" font-size="12">global config</text><text x="400" y="120" text-anchor="middle" class="svg-muted" font-size="12">change the device</text>
<rect x="490" y="20" width="140" height="170" rx="10" fill="#bbf7d0"/><text x="560" y="50" text-anchor="middle" class="svg-ink" font-size="14">Small rooms</text><text x="560" y="75" text-anchor="middle" class="svg-accent" font-size="12">(config-if)#</text><text x="560" y="95" text-anchor="middle" class="svg-accent" font-size="12">(config-line)#</text><text x="560" y="120" text-anchor="middle" class="svg-muted" font-size="12">one interface / line</text>
<line x1="150" y1="150" x2="170" y2="150" stroke="#64748b" stroke-width="2"/><line x1="310" y1="150" x2="330" y2="150" stroke="#64748b" stroke-width="2"/><line x1="470" y1="150" x2="490" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="160" y="175" text-anchor="middle" class="svg-muted" font-size="12">enable</text><text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">conf t</text><text x="480" y="175" text-anchor="middle" class="svg-muted" font-size="12">int / line</text>
</svg><p class="cap">Each level lets you do more. The prompt is your "you are here" sign.</p></div>

<h3>Why a command line, and not a web page?</h3>
<p>Many devices today also offer a web GUI or are managed by a controller, and you will study automation and controllers later in the CCNA. But the CLI is still the tool every network engineer uses daily, for four reasons:</p>
<ul>
<li><b>It is always there.</b> A device with no IP address and no configuration still has a console port and a CLI. The GUI needs an IP address first.</li>
<li><b>It is precise.</b> A command does exactly one thing, and the running configuration is plain text you can read, copy, compare and back up.</li>
<li><b>It scales.</b> The same text you type can be pasted into a hundred devices or sent by an automation script.</li>
<li><b>It is what the exam and interviews test.</b> CCNA questions show CLI output and ask what it means.</li>
</ul>

<h3>The IOS family</h3>
<p>"IOS" is used loosely for several related Cisco operating systems. Classic <b>IOS</b> ran on older ISR routers and Catalyst switches. <b>IOS XE</b> runs on current Catalyst 9000 switches and ISR 4000 / Catalyst 8000 routers; it is Linux-based underneath but gives you the same CLI. <b>NX-OS</b> (Nexus data center switches) and <b>IOS XR</b> (service provider routers) look similar but have their own differences. For the CCNA, everything you learn here applies to IOS and IOS XE, and the habits carry over to the others.</p>

<table class="cmp"><tr><th>OS</th><th>Where you meet it</th><th>CLI feel</th></tr>
<tr><td><b>IOS / IOS XE</b></td><td>Campus switches, branch routers</td><td>The CLI taught in this module</td></tr>
<tr><td><b>NX-OS</b></td><td>Nexus data center switches</td><td>Very similar, features enabled with <code>feature</code></td></tr>
<tr><td><b>IOS XR</b></td><td>Service provider routers</td><td>Similar, but changes need <code>commit</code></td></tr>
</table>

<h3>The lab network you will build</h3>
<p>All three labs use the same tiny office: one PC, one switch and one router on the subnet 192.168.10.0/24. The router is the default gateway at 192.168.10.1, the switch gets a management address 192.168.10.2, and the PC is 192.168.10.10.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Lab topology">
<rect x="30" y="60" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="90" y="82" text-anchor="middle" class="svg-ink" font-size="14">PC1</text><text x="90" y="100" text-anchor="middle" class="svg-muted" font-size="12">192.168.10.10</text>
<rect x="260" y="60" width="120" height="50" rx="8" fill="#bae6fd"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">Vlan1 .2</text>
<rect x="490" y="60" width="120" height="50" rx="8" fill="#fde68a"/><text x="550" y="82" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="550" y="100" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 .1</text>
<line x1="150" y1="85" x2="260" y2="85" stroke="#64748b" stroke-width="2"/><line x1="380" y1="85" x2="490" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="205" y="75" text-anchor="middle" class="svg-muted" font-size="12">Fa0/1</text><text x="435" y="75" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1 - Gi0/0</text>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="13">LAN 192.168.10.0/24</text>
</svg><p class="cap">The same three devices appear in every lab and example in this module.</p></div>

<div class="eg"><p><b>Worked example.</b> A fresh router boots and shows <code>Router&gt;</code>. You type <code>enable</code> and see <code>Router#</code>. You type <code>configure terminal</code> and see <code>Router(config)#</code>. You type <code>hostname R1</code> and the prompt instantly becomes <code>R1(config)#</code>. Four prompts, three levels, one change. That tiny sequence is the pattern for everything you will ever configure on IOS.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Treating the CLI like a chat window and typing commands without looking at the prompt. Most "command not working" problems in the first week are simply the right command typed in the wrong mode. Always read the prompt before you type.</p></div>

<div class="exam"><p><b>Exam trap.</b> Questions often show a prompt and ask which command is possible there. <code>&gt;</code> means user EXEC, <code>#</code> means privileged EXEC, and <code>(config...)#</code> means a configuration mode. Configuration commands never work at <code>&gt;</code> or plain <code>#</code>.</p></div>

<div class="scn"><h4>The intern and the "broken" router</h4><p>On her first day, an intern was asked to check a branch router's interfaces. She typed <code>show running-config</code> and got <code>% Invalid input detected at '^' marker</code>. She reported that the router was faulty. Her senior looked at the screen: the prompt was <code>BR-R1&gt;</code>. She was in user EXEC, where the running configuration is not visible. One <code>enable</code>, one password, and the command worked.</p><p><b>Lesson:</b> the prompt is the first thing to read. Most "errors" in IOS are mode errors.</p></div>

<div class="iv"><p class="q">"What is Cisco IOS and how do you normally interact with it?"</p><p>Strong answer: IOS is the operating system on Cisco routers and switches (IOS XE on current platforms). You manage it mainly through a hierarchical CLI, either locally over the console port or remotely over SSH. The CLI has user EXEC, privileged EXEC and configuration modes, and the prompt shows which one you are in. Mention that the active configuration is plain text in RAM (running-config) that must be saved to NVRAM (startup-config).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IOS is the operating system of Cisco routers and switches; IOS XE is its modern form with the same CLI.</li>
<li>You talk to IOS through a command-line interface with levels, like rooms in a secure building.</li>
<li>The prompt (<code>&gt;</code>, <code>#</code>, <code>(config)#</code>) tells you which level you are in.</li>
<li>The CLI works even on a device with no IP address, which is why every engineer must know it.</li>
<li>All labs in this module use PC1, SW1 and R1 on 192.168.10.0/24.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap ek bilkul naye Cisco switch ya router se connect kar paoge, uske command modes ke beech confidently move kar paoge, sab kuch ratne ki jagah built-in help use kar paoge, device ko naam de paoge, passwords se protect kar paoge, uske interfaces par IP addresses laga paoge, <code>show</code> commands se apna kaam check kar paoge aur result save kar paoge taaki reboot ke baad bhi rahe. Aapko yeh bhi pata hoga ki device boot hote waqt kya hota hai, uski configuration kahan rehti hai, aur pehle din ki classic problem ko kaise troubleshoot karna hai: "main apne router ko ping nahi kar pa raha".</p>
<p><b>Prerequisites.</b> Aapne <i>Networking from absolute zero</i> module khatam kar liya hona chahiye, taaki aapko pata ho ki switch, router, IP address aur subnet mask kya hote hain, aur PC ko default gateway kyun chahiye. Koi Cisco experience nahi chahiye. Is module ki har command pehli baar aate hi explain hoti hai, aur teen labs mein aap har ek ko simulated switch aur router par practise karoge.</p>

<h3>Ek analogy se shuru karo: IOS ek secure office building ka reception desk hai</h3>
<p>Ek bade office building ke baare mein socho. Saamne reception desk hai. Visitor receptionist se simple sawaal pooch sakta hai ("accounts kaunse floor par hai?") lekin kuch badal nahi sakta. Jo employee badge dikhata hai woh aur andar jaa sakta hai aur har file dekh sakta hai. Master key wala manager control room mein jaa kar poori building ka kaam karne ka tareeka badal sakta hai: meeting rooms ka naam badalna, door codes badalna, lifts ki wiring badalna. Control room ke andar specific kaam ke liye chhote rooms hain: ek lifts ke liye, ek doors ke liye, ek lights ke liye.</p>
<p><b>Cisco IOS</b> (Internetwork Operating System) bilkul aise hi kaam karta hai. Yeh woh operating system hai jo Cisco routers aur switches par chalta hai, aur aap isse <b>command-line interface (CLI)</b> ke through baat karte ho. CLI ke levels hain: visitor level jahan aap sirf dekh sakte ho (<b>user EXEC</b>), employee level jahan aap sab kuch dekh sakte ho aur tests chala sakte ho (<b>privileged EXEC</b>), control room jahan aap configuration badalte ho (<b>global configuration</b>), aur ek interface ya ek line ke liye chhote rooms (<b>sub-modes</b>). Line ke end ka prompt batata hai ki aap kaunse room mein khade ho.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="IOS access levels rooms ki tarah">
<rect x="10" y="20" width="140" height="170" rx="10" fill="#e2e8f0"/><text x="80" y="50" text-anchor="middle" class="svg-ink" font-size="14">Reception</text><text x="80" y="75" text-anchor="middle" class="svg-accent" font-size="14">Router&gt;</text><text x="80" y="100" text-anchor="middle" class="svg-muted" font-size="12">user EXEC</text><text x="80" y="120" text-anchor="middle" class="svg-muted" font-size="12">sirf dekhna</text>
<rect x="170" y="20" width="140" height="170" rx="10" fill="#bae6fd"/><text x="240" y="50" text-anchor="middle" class="svg-ink" font-size="14">Staff area</text><text x="240" y="75" text-anchor="middle" class="svg-accent" font-size="14">Router#</text><text x="240" y="100" text-anchor="middle" class="svg-muted" font-size="12">privileged EXEC</text><text x="240" y="120" text-anchor="middle" class="svg-muted" font-size="12">sab dekho, test, save</text>
<rect x="330" y="20" width="140" height="170" rx="10" fill="#fde68a"/><text x="400" y="50" text-anchor="middle" class="svg-ink" font-size="14">Control room</text><text x="400" y="75" text-anchor="middle" class="svg-accent" font-size="13">Router(config)#</text><text x="400" y="100" text-anchor="middle" class="svg-muted" font-size="12">global config</text><text x="400" y="120" text-anchor="middle" class="svg-muted" font-size="12">device badlo</text>
<rect x="490" y="20" width="140" height="170" rx="10" fill="#bbf7d0"/><text x="560" y="50" text-anchor="middle" class="svg-ink" font-size="14">Chhote rooms</text><text x="560" y="75" text-anchor="middle" class="svg-accent" font-size="12">(config-if)#</text><text x="560" y="95" text-anchor="middle" class="svg-accent" font-size="12">(config-line)#</text><text x="560" y="120" text-anchor="middle" class="svg-muted" font-size="12">ek interface / line</text>
<line x1="150" y1="150" x2="170" y2="150" stroke="#64748b" stroke-width="2"/><line x1="310" y1="150" x2="330" y2="150" stroke="#64748b" stroke-width="2"/><line x1="470" y1="150" x2="490" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="160" y="175" text-anchor="middle" class="svg-muted" font-size="12">enable</text><text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">conf t</text><text x="480" y="175" text-anchor="middle" class="svg-muted" font-size="12">int / line</text>
</svg><p class="cap">Har level aapko zyada karne deta hai. Prompt aapka "aap yahan ho" sign hai.</p></div>

<h3>Command line kyun, web page kyun nahi?</h3>
<p>Aaj bahut saare devices web GUI bhi dete hain ya controller se manage hote hain, aur automation aur controllers aap CCNA mein aage padhoge. Lekin CLI aaj bhi woh tool hai jo har network engineer roz use karta hai, chaar wajah se:</p>
<ul>
<li><b>Yeh hamesha hota hai.</b> Jis device par koi IP address aur koi configuration nahi hai, uske paas bhi console port aur CLI hota hai. GUI ko pehle IP address chahiye.</li>
<li><b>Yeh precise hai.</b> Ek command bilkul ek kaam karti hai, aur running configuration plain text hai jise aap padh sakte ho, copy kar sakte ho, compare kar sakte ho aur backup le sakte ho.</li>
<li><b>Yeh scale karta hai.</b> Jo text aap type karte ho wahi sau devices mein paste ho sakta hai ya automation script se bheja ja sakta hai.</li>
<li><b>Exam aur interviews yahi test karte hain.</b> CCNA questions CLI output dikhate hain aur poochte hain ki iska matlab kya hai.</li>
</ul>

<h3>IOS family</h3>
<p>"IOS" shabd kai related Cisco operating systems ke liye loosely use hota hai. Classic <b>IOS</b> purane ISR routers aur Catalyst switches par chalta tha. <b>IOS XE</b> aaj ke Catalyst 9000 switches aur ISR 4000 / Catalyst 8000 routers par chalta hai; andar se yeh Linux-based hai lekin aapko wahi CLI deta hai. <b>NX-OS</b> (Nexus data center switches) aur <b>IOS XR</b> (service provider routers) milte-julte dikhte hain lekin unke apne farak hain. CCNA ke liye, jo aap yahan seekhoge woh IOS aur IOS XE par apply hota hai, aur yeh habits baaki par bhi kaam aati hain.</p>

<table class="cmp"><tr><th>OS</th><th>Kahan milta hai</th><th>CLI ka feel</th></tr>
<tr><td><b>IOS / IOS XE</b></td><td>Campus switches, branch routers</td><td>Wahi CLI jo is module mein sikhaya gaya hai</td></tr>
<tr><td><b>NX-OS</b></td><td>Nexus data center switches</td><td>Bahut milta-julta, features <code>feature</code> se enable hote hain</td></tr>
<tr><td><b>IOS XR</b></td><td>Service provider routers</td><td>Milta-julta, lekin changes ke liye <code>commit</code> chahiye</td></tr>
</table>

<h3>Lab network jo aap banaoge</h3>
<p>Teeno labs ek hi chhota office use karte hain: ek PC, ek switch aur ek router, subnet 192.168.10.0/24 par. Router 192.168.10.1 par default gateway hai, switch ko management address 192.168.10.2 milta hai, aur PC 192.168.10.10 hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Lab topology">
<rect x="30" y="60" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="90" y="82" text-anchor="middle" class="svg-ink" font-size="14">PC1</text><text x="90" y="100" text-anchor="middle" class="svg-muted" font-size="12">192.168.10.10</text>
<rect x="260" y="60" width="120" height="50" rx="8" fill="#bae6fd"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">Vlan1 .2</text>
<rect x="490" y="60" width="120" height="50" rx="8" fill="#fde68a"/><text x="550" y="82" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="550" y="100" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 .1</text>
<line x1="150" y1="85" x2="260" y2="85" stroke="#64748b" stroke-width="2"/><line x1="380" y1="85" x2="490" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="205" y="75" text-anchor="middle" class="svg-muted" font-size="12">Fa0/1</text><text x="435" y="75" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1 - Gi0/0</text>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="13">LAN 192.168.10.0/24</text>
</svg><p class="cap">Yahi teen devices is module ke har lab aur example mein aate hain.</p></div>

<div class="eg"><p><b>Worked example.</b> Ek fresh router boot hota hai aur <code>Router&gt;</code> dikhata hai. Aap <code>enable</code> type karte ho aur <code>Router#</code> dikhta hai. Aap <code>configure terminal</code> type karte ho aur <code>Router(config)#</code> dikhta hai. Aap <code>hostname R1</code> type karte ho aur prompt turant <code>R1(config)#</code> ban jaata hai. Chaar prompts, teen levels, ek change. Yahi chhota sa sequence har us cheez ka pattern hai jo aap kabhi IOS par configure karoge.</p></div>

<div class="warn"><p><b>Beginners ki common galti.</b> CLI ko chat window ki tarah treat karna aur prompt dekhe bina commands type karna. Pehle hafte ki zyada tar "command kaam nahi kar rahi" problems bas sahi command galat mode mein type karne ki wajah se hoti hain. Type karne se pehle hamesha prompt padho.</p></div>

<div class="exam"><p><b>Exam trap.</b> Questions aksar ek prompt dikhate hain aur poochte hain ki wahan kaunsi command possible hai. <code>&gt;</code> ka matlab user EXEC, <code>#</code> ka matlab privileged EXEC, aur <code>(config...)#</code> ka matlab koi configuration mode. Configuration commands <code>&gt;</code> ya plain <code>#</code> par kabhi kaam nahi karti.</p></div>

<div class="scn"><h4>Intern aur "kharab" router</h4><p>Apne pehle din ek intern ko branch router ke interfaces check karne ko kaha gaya. Usne <code>show running-config</code> type kiya aur <code>% Invalid input detected at '^' marker</code> mila. Usne report kiya ki router kharab hai. Uske senior ne screen dekhi: prompt <code>BR-R1&gt;</code> tha. Woh user EXEC mein thi, jahan running configuration dikhti hi nahi. Ek <code>enable</code>, ek password, aur command chal gayi.</p><p><b>Seekh:</b> sabse pehle prompt padho. IOS mein zyada tar "errors" mode errors hote hain.</p></div>

<div class="iv"><p class="q">"Cisco IOS kya hai aur aap normally isse kaise interact karte ho?"</p><p>Strong answer: IOS Cisco routers aur switches ka operating system hai (current platforms par IOS XE). Aap ise mainly ek hierarchical CLI se manage karte ho, ya to locally console port se ya remotely SSH se. CLI mein user EXEC, privileged EXEC aur configuration modes hain, aur prompt batata hai ki aap kis mein ho. Yeh zaroor bolo ki active configuration RAM mein plain text hai (running-config) jise NVRAM mein save karna padta hai (startup-config).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IOS Cisco routers aur switches ka operating system hai; IOS XE uska modern roop hai jismein wahi CLI hai.</li>
<li>Aap IOS se levels wale command-line interface se baat karte ho, jaise secure building ke rooms.</li>
<li>Prompt (<code>&gt;</code>, <code>#</code>, <code>(config)#</code>) batata hai ki aap kaunse level mein ho.</li>
<li>CLI un devices par bhi kaam karta hai jinka koi IP address nahi hai, isliye har engineer ko ise aana chahiye.</li>
<li>Is module ke saare labs PC1, SW1 aur R1 ko 192.168.10.0/24 par use karte hain.</li>
</ul></div>
`}};export{e as default};