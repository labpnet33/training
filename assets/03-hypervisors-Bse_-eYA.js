var e={id:`hypervisors`,h:{en:`Type-1 vs type-2 hypervisors`,hi:`Type-1 vs type-2 hypervisors`},body:{en:`
<p>Imagine two ways to run a food business. In the first, you build a proper restaurant kitchen from the ground up: the kitchen <i>is</i> the building. In the second, you cook in your home kitchen, squeezed in between the family's breakfast and dinner. Both produce meals, but only one is designed to serve hundreds of customers all day. Hypervisors come in the same two flavours.</p>

<h3>Type 1: bare-metal hypervisor</h3>
<p>A <b>type-1</b> hypervisor is installed <b>directly on the server hardware</b>, in place of a general-purpose operating system. It is itself a small, specialised OS whose only job is to run VMs. Because there is no extra layer between it and the hardware, it has less overhead, better stability and stronger isolation.</p>
<ul>
<li>Examples: <b>VMware ESXi</b>, <b>Microsoft Hyper-V</b> (even when installed as a Windows Server role, Hyper-V slides underneath Windows, which then runs as a privileged "parent partition"), <b>KVM</b> (a module that turns the Linux kernel itself into the hypervisor), <b>Xen</b> and <b>Nutanix AHV</b>.</li>
<li>Managed remotely: a web interface, APIs and a central manager (for example VMware vCenter) that controls many hosts as one <b>cluster</b>.</li>
<li>Used in data centers, private clouds and every public cloud.</li>
</ul>

<h3>Type 2: hosted hypervisor</h3>
<p>A <b>type-2</b> hypervisor is an <b>application running on top of a normal host OS</b> such as Windows, macOS or desktop Linux. The host OS owns the hardware; the hypervisor asks it for CPU, memory and devices like any other program.</p>
<ul>
<li>Examples: <b>Oracle VirtualBox</b>, <b>VMware Workstation</b> and <b>VMware Fusion</b>, <b>Parallels Desktop</b>.</li>
<li>Used on laptops and desktops: labs (many students run network simulators this way), testing software on another OS, a developer's sandbox.</li>
<li>Weaknesses: the host OS takes its share of resources, and if the host OS crashes or reboots for updates, every VM goes down with it.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Type-1 vs type-2 stack">
<text x="160" y="22" text-anchor="middle" class="svg-accent" font-size="13">Type 1 (bare metal)</text>
<rect x="40" y="36" width="115" height="50" rx="6" fill="#bbf7d0"/><text x="97" y="66" text-anchor="middle" class="svg-ink" font-size="12">VM + guest OS</text>
<rect x="165" y="36" width="115" height="50" rx="6" fill="#bbf7d0"/><text x="222" y="66" text-anchor="middle" class="svg-ink" font-size="12">VM + guest OS</text>
<rect x="40" y="96" width="240" height="40" rx="6" fill="#bae6fd"/><text x="160" y="121" text-anchor="middle" class="svg-ink" font-size="13">Hypervisor (ESXi, KVM)</text>
<rect x="40" y="146" width="240" height="40" rx="6" fill="#e2e8f0"/><text x="160" y="171" text-anchor="middle" class="svg-ink" font-size="13">Server hardware</text>
<text x="480" y="22" text-anchor="middle" class="svg-accent" font-size="13">Type 2 (hosted)</text>
<rect x="360" y="36" width="115" height="50" rx="6" fill="#bbf7d0"/><text x="417" y="66" text-anchor="middle" class="svg-ink" font-size="12">VM + guest OS</text>
<rect x="485" y="36" width="115" height="50" rx="6" fill="#bbf7d0"/><text x="542" y="66" text-anchor="middle" class="svg-ink" font-size="12">VM + guest OS</text>
<rect x="360" y="96" width="240" height="40" rx="6" fill="#bae6fd"/><text x="480" y="121" text-anchor="middle" class="svg-ink" font-size="13">Hypervisor app (VirtualBox)</text>
<rect x="360" y="146" width="240" height="40" rx="6" fill="#fde68a"/><text x="480" y="171" text-anchor="middle" class="svg-ink" font-size="13">Host OS (Windows, macOS)</text>
<rect x="360" y="196" width="240" height="40" rx="6" fill="#e2e8f0"/><text x="480" y="221" text-anchor="middle" class="svg-ink" font-size="13">PC / laptop hardware</text>
<text x="320" y="266" text-anchor="middle" class="svg-muted" font-size="12">type 2 has one extra layer: the host OS</text>
</svg><p class="cap">Where the hypervisor sits is the whole difference between type 1 and type 2.</p></div>

<h3>Side-by-side comparison</h3>
<table class="cmp"><tr><th></th><th>Type 1 (bare metal)</th><th>Type 2 (hosted)</th></tr>
<tr><td>Runs on</td><td>the hardware directly</td><td>a general-purpose host OS</td></tr>
<tr><td>Examples</td><td>ESXi, Hyper-V, KVM, Xen</td><td>VirtualBox, VMware Workstation / Fusion, Parallels</td></tr>
<tr><td>Performance and scale</td><td>high: many VMs, clustering, live migration, HA</td><td>lower: host OS overhead, single machine</td></tr>
<tr><td>Failure domain</td><td>only the hypervisor</td><td>host OS crash or reboot stops every VM</td></tr>
<tr><td>Typical place</td><td>data center, private and public cloud</td><td>laptop, lab, testing</td></tr></table>

<h3>Hardware support</h3>
<p>Modern CPUs contain virtualization extensions, <b>Intel VT-x</b> and <b>AMD-V</b>, that let the hypervisor run guest code directly on the CPU safely. On a laptop they are sometimes disabled in the BIOS or UEFI settings, and a type-2 hypervisor then refuses to start 64-bit VMs. This is the most common reason a student's lab VM "will not boot".</p>

<h3>The lab hypervisor</h3>
<p>The hosts HV1 and HV2 in this module are type-1 hypervisors. When you open their console you do not land in Windows or Linux; you land straight in the hypervisor shell:</p>
<pre class="out">HV1:~# version
<span class="hl">NK Hypervisor 8.0 (bare-metal, type-1) — NK-OS learning simulator</span>
Host: HV1   Model: NK-HV8   CPU: 2 sockets x 16 cores   Memory: 256 GB
Virtual switch: vSwitch0   Registered VMs: 2   Containers: 0</pre>
<p>The line to notice is "bare-metal, type-1". The host also shows exactly one virtual switch, <code>vSwitch0</code>, which you will configure in the next chapter.</p>

<div class="eg"><p><b>Worked example.</b> A training company needs (a) 40 production VMs running a learning platform 24x7, and (b) a way for each trainer to run a small three-VM lab on a laptop while travelling. Choice: (a) three hosts running a type-1 hypervisor in a cluster, so one host can fail or be patched while VMs move to the others; (b) a type-2 hypervisor such as VirtualBox on each laptop, because the trainer still needs Windows for email and slides.</p></div>

<div class="warn"><p><b>Common mistake.</b> Calling Hyper-V type 2 "because you install it from Windows". Once the role is enabled, Hyper-V runs directly on the hardware and Windows becomes a partition above it. The installation method does not define the type; the position in the stack does.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which hypervisor type is installed directly on hardware and is used in data centers?" is type 1. "Which one runs as an application on a desktop OS?" is type 2. Also remember that containers need <b>no hypervisor</b> at all; they need a container engine on an OS.</p></div>

<div class="scn"><h4>The lab that died with Windows Update</h4><p>A small branch ran its only file server as a VM inside VirtualBox on a desktop PC to save money. Every second Tuesday the PC installed Windows updates and rebooted overnight, and every Wednesday morning users could not open shared files until someone logged in and restarted the VM. Moving the VM onto a small type-1 host removed the dependency on a desktop OS.</p><p><b>Lesson:</b> type 2 is fine for labs; production workloads belong on a type-1 hypervisor.</p></div>

<div class="iv"><p class="q">"Explain the difference between type-1 and type-2 hypervisors, with examples."</p><p>Type 1 runs directly on the hardware (ESXi, Hyper-V, KVM) and is used in data centers and clouds for performance, isolation and features like clustering and live migration. Type 2 runs as an application on a host OS (VirtualBox, VMware Workstation) and is used for labs and desktops; the host OS adds overhead and is a single point of failure. Bonus: mention VT-x / AMD-V and that Hyper-V is type 1 even though it is enabled from Windows.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Type 1 = bare metal: ESXi, Hyper-V, KVM, Xen; data centers and clouds.</li>
<li>Type 2 = hosted on a desktop OS: VirtualBox, VMware Workstation / Fusion, Parallels; labs and testing.</li>
<li>Type 2 adds a host OS layer: more overhead and one more thing that can crash or reboot.</li>
<li>CPU extensions Intel VT-x / AMD-V must be enabled for hypervisors to run 64-bit guests efficiently.</li>
<li>The lab hosts HV1 and HV2 are type-1 hypervisors with one virtual switch, vSwitch0.</li>
</ul></div>
`,hi:`
<p>Food business chalane ke do tarike socho. Pehle mein aap zameen se ek proper restaurant kitchen banate ho: kitchen hi building <i>hai</i>. Doosre mein aap ghar ki kitchen mein khana banate ho, family ke breakfast aur dinner ke beech mein fit karke. Dono khana banate hain, par sirf ek poore din sainkdon customers ko serve karne ke liye design hua hai. Hypervisors bhi isi tarah do flavours mein aate hain.</p>

<h3>Type 1: bare-metal hypervisor</h3>
<p><b>Type-1</b> hypervisor general-purpose operating system ki jagah <b>seedha server hardware par</b> install hota hai. Yeh khud ek chhota, specialised OS hai jiska ek hi kaam hai VMs chalana. Kyunki iske aur hardware ke beech koi extra layer nahi hoti, isliye overhead kam, stability behtar aur isolation mazboot hoti hai.</p>
<ul>
<li>Examples: <b>VMware ESXi</b>, <b>Microsoft Hyper-V</b> (Windows Server role ki tarah install karne par bhi Hyper-V Windows ke neeche chala jaata hai, aur Windows phir privileged "parent partition" ki tarah chalta hai), <b>KVM</b> (ek module jo Linux kernel ko hi hypervisor bana deta hai), <b>Xen</b> aur <b>Nutanix AHV</b>.</li>
<li>Remotely manage hota hai: web interface, APIs aur ek central manager (jaise VMware vCenter) jo kai hosts ko ek <b>cluster</b> ki tarah control karta hai.</li>
<li>Data centers, private clouds aur har public cloud mein use hota hai.</li>
</ul>

<h3>Type 2: hosted hypervisor</h3>
<p><b>Type-2</b> hypervisor Windows, macOS ya desktop Linux jaise <b>normal host OS ke upar chalne wali application</b> hai. Hardware host OS ka hai; hypervisor kisi bhi doosre program ki tarah usse CPU, memory aur devices maangta hai.</p>
<ul>
<li>Examples: <b>Oracle VirtualBox</b>, <b>VMware Workstation</b> aur <b>VMware Fusion</b>, <b>Parallels Desktop</b>.</li>
<li>Laptops aur desktops par use hota hai: labs (kai students network simulators isi tarah chalate hain), doosre OS par software test karna, developer ka sandbox.</li>
<li>Kamzoriyan: host OS resources ka apna hissa leta hai, aur agar host OS crash ho ya updates ke liye reboot ho, to har VM uske saath band ho jaati hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Type-1 vs type-2 stack">
<text x="160" y="22" text-anchor="middle" class="svg-accent" font-size="13">Type 1 (bare metal)</text>
<rect x="40" y="36" width="115" height="50" rx="6" fill="#bbf7d0"/><text x="97" y="66" text-anchor="middle" class="svg-ink" font-size="12">VM + guest OS</text>
<rect x="165" y="36" width="115" height="50" rx="6" fill="#bbf7d0"/><text x="222" y="66" text-anchor="middle" class="svg-ink" font-size="12">VM + guest OS</text>
<rect x="40" y="96" width="240" height="40" rx="6" fill="#bae6fd"/><text x="160" y="121" text-anchor="middle" class="svg-ink" font-size="13">Hypervisor (ESXi, KVM)</text>
<rect x="40" y="146" width="240" height="40" rx="6" fill="#e2e8f0"/><text x="160" y="171" text-anchor="middle" class="svg-ink" font-size="13">Server hardware</text>
<text x="480" y="22" text-anchor="middle" class="svg-accent" font-size="13">Type 2 (hosted)</text>
<rect x="360" y="36" width="115" height="50" rx="6" fill="#bbf7d0"/><text x="417" y="66" text-anchor="middle" class="svg-ink" font-size="12">VM + guest OS</text>
<rect x="485" y="36" width="115" height="50" rx="6" fill="#bbf7d0"/><text x="542" y="66" text-anchor="middle" class="svg-ink" font-size="12">VM + guest OS</text>
<rect x="360" y="96" width="240" height="40" rx="6" fill="#bae6fd"/><text x="480" y="121" text-anchor="middle" class="svg-ink" font-size="13">Hypervisor app (VirtualBox)</text>
<rect x="360" y="146" width="240" height="40" rx="6" fill="#fde68a"/><text x="480" y="171" text-anchor="middle" class="svg-ink" font-size="13">Host OS (Windows, macOS)</text>
<rect x="360" y="196" width="240" height="40" rx="6" fill="#e2e8f0"/><text x="480" y="221" text-anchor="middle" class="svg-ink" font-size="13">PC / laptop hardware</text>
<text x="320" y="266" text-anchor="middle" class="svg-muted" font-size="12">type 2 mein ek extra layer hai: host OS</text>
</svg><p class="cap">Hypervisor kahan baitha hai, bas yahi type 1 aur type 2 ka poora fark hai.</p></div>

<h3>Side-by-side comparison</h3>
<table class="cmp"><tr><th></th><th>Type 1 (bare metal)</th><th>Type 2 (hosted)</th></tr>
<tr><td>Kis par chalta hai</td><td>seedha hardware par</td><td>general-purpose host OS par</td></tr>
<tr><td>Examples</td><td>ESXi, Hyper-V, KVM, Xen</td><td>VirtualBox, VMware Workstation / Fusion, Parallels</td></tr>
<tr><td>Performance aur scale</td><td>high: kai VMs, clustering, live migration, HA</td><td>kam: host OS overhead, single machine</td></tr>
<tr><td>Failure domain</td><td>sirf hypervisor</td><td>host OS crash ya reboot har VM ko rok deta hai</td></tr>
<tr><td>Aam jagah</td><td>data center, private aur public cloud</td><td>laptop, lab, testing</td></tr></table>

<h3>Hardware support</h3>
<p>Modern CPUs mein virtualization extensions hoti hain, <b>Intel VT-x</b> aur <b>AMD-V</b>, jo hypervisor ko guest code seedha CPU par safely chalane deti hain. Laptop par kabhi kabhi yeh BIOS ya UEFI settings mein disabled hoti hain, aur tab type-2 hypervisor 64-bit VMs start karne se mana kar deta hai. Student ki lab VM ke "boot na hone" ki yahi sabse common wajah hai.</p>

<h3>Lab ka hypervisor</h3>
<p>Is module ke hosts HV1 aur HV2 type-1 hypervisors hain. Jab aap unka console kholte ho to aap Windows ya Linux mein nahi pahunchte; seedha hypervisor shell mein pahunchte ho:</p>
<pre class="out">HV1:~# version
<span class="hl">NK Hypervisor 8.0 (bare-metal, type-1) — NK-OS learning simulator</span>
Host: HV1   Model: NK-HV8   CPU: 2 sockets x 16 cores   Memory: 256 GB
Virtual switch: vSwitch0   Registered VMs: 2   Containers: 0</pre>
<p>Dhyan dene wali line hai "bare-metal, type-1". Host bilkul ek virtual switch bhi dikhata hai, <code>vSwitch0</code>, jise aap agle chapter mein configure karoge.</p>

<div class="eg"><p><b>Worked example.</b> Ek training company ko chahiye (a) 24x7 learning platform chalane wali 40 production VMs, aur (b) har trainer ke liye travel karte hue laptop par teen VMs ka chhota lab chalane ka tarika. Choice: (a) cluster mein type-1 hypervisor chalane wale teen hosts, taaki ek host fail ho ya patch ho to VMs baaki hosts par chali jaayein; (b) har laptop par VirtualBox jaisa type-2 hypervisor, kyunki trainer ko email aur slides ke liye Windows bhi chahiye.</p></div>

<div class="warn"><p><b>Common galti.</b> Hyper-V ko type 2 kehna "kyunki use Windows se install karte hain". Role enable hone ke baad Hyper-V seedha hardware par chalta hai aur Windows uske upar ek partition ban jaata hai. Installation ka tarika type define nahi karta; stack mein position karti hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kaunsa hypervisor type seedha hardware par install hota hai aur data centers mein use hota hai?" type 1 hai. "Kaunsa desktop OS par application ki tarah chalta hai?" type 2 hai. Yeh bhi yaad rakho ki containers ko <b>koi hypervisor nahi</b> chahiye; unhe OS par container engine chahiye.</p></div>

<div class="scn"><h4>Woh lab jo Windows Update ke saath mar gaya</h4><p>Ek chhoti branch paisa bachane ke liye apna ekmatra file server ek desktop PC par VirtualBox ke andar VM ki tarah chala rahi thi. Har doosre Tuesday PC Windows updates install karke raat mein reboot hota, aur har Wednesday subah users shared files tab tak nahi khol paate jab tak koi login karke VM restart na kare. VM ko ek chhote type-1 host par move karne se desktop OS par dependency khatam ho gayi.</p><p><b>Seekh:</b> labs ke liye type 2 theek hai; production workloads type-1 hypervisor par hone chahiye.</p></div>

<div class="iv"><p class="q">"Type-1 aur type-2 hypervisors ka fark examples ke saath samjhao."</p><p>Type 1 seedha hardware par chalta hai (ESXi, Hyper-V, KVM) aur data centers aur clouds mein performance, isolation aur clustering aur live migration jaise features ke liye use hota hai. Type 2 host OS par application ki tarah chalta hai (VirtualBox, VMware Workstation) aur labs aur desktops ke liye use hota hai; host OS overhead jodta hai aur single point of failure hai. Bonus: VT-x / AMD-V mention karo aur yeh ki Hyper-V Windows se enable hone ke bawajood type 1 hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Type 1 = bare metal: ESXi, Hyper-V, KVM, Xen; data centers aur clouds.</li>
<li>Type 2 = desktop OS par hosted: VirtualBox, VMware Workstation / Fusion, Parallels; labs aur testing.</li>
<li>Type 2 ek host OS layer jodta hai: zyada overhead aur ek aur cheez jo crash ya reboot ho sakti hai.</li>
<li>Hypervisors ko 64-bit guests efficiently chalane ke liye CPU extensions Intel VT-x / AMD-V enabled honi chahiye.</li>
<li>Lab hosts HV1 aur HV2 type-1 hypervisors hain jinke paas ek virtual switch, vSwitch0, hai.</li>
</ul></div>
`}};export{e as default};