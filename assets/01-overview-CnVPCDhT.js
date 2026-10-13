var e={id:`overview`,h:{en:`Why Linux? What you will learn and the big picture`,hi:`Linux kyun? Kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn to move around a Linux server with confidence: read the prompt, understand the directory tree, create, copy, move and delete files safely, use wildcards, and find a file or a piece of text among hundreds of files. These are the first skills of the <b>Linux for Network Engineers</b> track. The next two modules build on them: reading logs with pipes (lx-text) and users, permissions and sudo (lx-users).</p>
<p><b>Prerequisites.</b> None. You do not need to have ever seen Linux. If you can use a computer, open a folder and you know what an IP address and SSH are, you are ready. Every command is explained the first time it appears, one small idea per chapter.</p>

<h3>Analogy: a Linux server is a building and the shell is a receptionist</h3>
<p>Think of a big office building. It has floors, rooms and cupboards (the <b>directories</b>), and papers inside them (the <b>files</b>). On Windows you walk around with the mouse. On a Linux server there is usually no mouse and no screen: you stand at a reception desk and <b>type requests</b>. The receptionist is the <b>shell</b>. You say <i>"list the papers in this room"</i> (<code>ls</code>), <i>"go to the room called logs"</i> (<code>cd logs</code>), <i>"show me this paper"</i> (<code>cat notes.txt</code>). The shell carries out the request and answers in text.</p>

<h3>Why does a network engineer need this?</h3>
<p>Routers and switches are only half of your world. The other half is Linux:</p>
<ul>
<li><b>Jump host (bastion).</b> The one server you SSH into first, and from there to every router. Nobody logs in to a core router straight from a laptop.</li>
<li><b>Syslog, TFTP, NTP and monitoring servers.</b> They collect router logs and keep configuration backups as plain files.</li>
<li><b>Automation host.</b> Python scripts, Ansible playbooks and Git live on a Linux box.</li>
<li><b>Network operating systems.</b> NX-OS, Arista EOS, Cumulus Linux, SONiC and many firewalls have a Linux shell underneath.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Laptop to jump host to devices">
<rect x="20" y="55" width="120" height="60" rx="10" fill="#e2e8f0"/><text x="80" y="82" text-anchor="middle" class="svg-ink" font-size="14">Your laptop</text><text x="80" y="102" text-anchor="middle" class="svg-muted" font-size="12">terminal</text>
<rect x="230" y="45" width="160" height="80" rx="10" fill="#bae6fd"/><text x="310" y="75" text-anchor="middle" class="svg-ink" font-size="14">NMS01 (Linux)</text><text x="310" y="95" text-anchor="middle" class="svg-muted" font-size="12">jump host + backups</text>
<rect x="490" y="15" width="130" height="40" rx="10" fill="#bbf7d0"/><text x="555" y="40" text-anchor="middle" class="svg-ink" font-size="13">Router R1</text>
<rect x="490" y="65" width="130" height="40" rx="10" fill="#bbf7d0"/><text x="555" y="90" text-anchor="middle" class="svg-ink" font-size="13">Router R2</text>
<rect x="490" y="115" width="130" height="40" rx="10" fill="#bbf7d0"/><text x="555" y="140" text-anchor="middle" class="svg-ink" font-size="13">Switch SW1</text>
<line x1="140" y1="85" x2="230" y2="85" stroke="#64748b" stroke-width="2"/><text x="185" y="78" text-anchor="middle" class="svg-accent" font-size="12">SSH</text>
<line x1="390" y1="75" x2="490" y2="35" stroke="#64748b" stroke-width="2"/><line x1="390" y1="85" x2="490" y2="85" stroke="#64748b" stroke-width="2"/><line x1="390" y1="95" x2="490" y2="135" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The Linux jump host sits between you and the network devices.</p></div>

<h3>The words you must know</h3>
<dl class="terms">
<dt>Terminal</dt><dd>The window where you type. It only shows text.</dd>
<dt>Shell</dt><dd>The program that reads what you type and runs it. On Ubuntu it is <b>bash</b>.</dd>
<dt>Command</dt><dd>A program you ask the shell to run, such as <code>ls</code>.</dd>
<dt>Option (flag)</dt><dd>A switch that changes how the command works, written with a dash: <code>-l</code>.</dd>
<dt>Argument</dt><dd>What the command works on, such as a file or directory name.</dd>
</dl>
<p>Every command has the same shape: <code>command  options  arguments</code>. For example <code>ls -l /var/log</code> means: run <code>ls</code>, with the option <code>-l</code> (long format), on the directory <code>/var/log</code>. Spaces separate the parts. <b>Linux is case-sensitive</b>: <code>Notes.txt</code> and <code>notes.txt</code> are two different files.</p>

<h3>Your lab server</h3>
<p>The labs run on a simulated <b>Ubuntu 24.04</b> server called <b>NMS01</b>, the monitoring server of the Deccan Net NOC. You log in as <code>netadmin</code>. It is an educational simulation, but the commands and messages follow real Ubuntu. Here are your first four commands, with the real output from the simulator:</p>
<pre class="code">netadmin@nms01:~$ whoami
netadmin
netadmin@nms01:~$ hostname
nms01
netadmin@nms01:~$ pwd
/home/netadmin
netadmin@nms01:~$ ls
incoming</pre>
<p><code>whoami</code> prints the user you are, <code>hostname</code> the name of the server, <code>pwd</code> the directory you are standing in, and <code>ls</code> lists what is in it. Only one folder, <code>incoming</code>, is there today.</p>
<pre class="out">netadmin@nms01:~$ uname -a
Linux nms01 6.8.0-45-generic #45-Ubuntu SMP PREEMPT_DYNAMIC Fri Aug 30 12:02:04 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux</pre>
<p><code>uname -a</code> shows the kernel (the core of the operating system). Ubuntu 24.04 ships with a 6.8 kernel.</p>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) Typing a command in the wrong case: <code>LS</code> is not <code>ls</code> on a real server. (2) Expecting an undo. Linux has no recycle bin and no "are you sure". Read the command before you press Enter. (3) Being afraid of the terminal. Reading commands such as <code>ls</code>, <code>cat</code> and <code>pwd</code> cannot break anything.</p></div>
<div class="exam"><p><b>Exam and interview trap.</b> "Linux" is the kernel; Ubuntu, Debian, RHEL and Rocky are <b>distributions</b> that package it. Commands in this track work on all of them. Where Ubuntu/Debian and RHEL-family systems differ (package manager, firewall tool, user group names) the chapter says so.</p></div>

<div class="scn"><h4>2 a.m., one config needed</h4><p>A core router in Pune crashed and was replaced. The on-call engineer had no copy of its config on his laptop. He SSH'd to the jump host, ran <code>ls</code> in the backup folder, and found last night's file in seconds. He copied it to the TFTP folder and the new router loaded it in five minutes. A colleague who did not know Linux would have been waiting for someone to wake up.</p><p><b>Lesson:</b> backups are only useful if you can find and read them on a Linux server.</p></div>

<div class="iv"><p class="q">"Why does a network engineer need to know Linux?"</p><p>Because most of the supporting infrastructure runs on it: jump hosts, syslog and TFTP servers, monitoring, automation tools, and the network operating systems themselves. Name three tasks you do on it daily: read a log, find a config backup, and check which user changed a file. Mention that you are comfortable, not an administrator.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The terminal shows text; the shell (bash) runs your commands.</li>
<li>A command looks like <code>command options arguments</code>.</li>
<li>Linux is case-sensitive and has no recycle bin.</li>
<li>Jump hosts, syslog, TFTP and automation boxes are Linux servers.</li>
<li>The lab server is Ubuntu 24.04 called NMS01, user netadmin.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap Linux server par confidence ke saath ghoomna seekhoge: prompt padhna, directory tree samajhna, files ko safely create, copy, move aur delete karna, wildcards use karna, aur saikdon files mein se koi file ya text dhoondhna. Yeh <b>Linux for Network Engineers</b> track ki pehli skills hain. Agle do modules inpar bante hain: pipes ke saath logs padhna (lx-text) aur users, permissions aur sudo (lx-users).</p>
<p><b>Prerequisites.</b> Koi nahi. Aapne kabhi Linux nahi dekha to bhi chalega. Agar aap computer chala lete ho, folder kholte ho aur IP address aur SSH kya hote hain jaante ho, to aap ready ho. Har command pehli baar aate hi samjhaya jaata hai, har chapter mein ek chhoti idea.</p>

<h3>Analogy: Linux server ek building hai aur shell ek receptionist</h3>
<p>Ek badi office building socho. Usme floors, rooms aur almariyan hain (<b>directories</b>), aur unke andar kagaz (<b>files</b>). Windows par aap mouse se ghoomte ho. Linux server par aksar mouse aur screen nahi hoti: aap reception desk par khade hokar <b>requests type</b> karte ho. Receptionist <b>shell</b> hai. Aap kehte ho <i>"is kamre ke kagaz dikhao"</i> (<code>ls</code>), <i>"logs naam ke kamre mein jao"</i> (<code>cd logs</code>), <i>"yeh kagaz dikhao"</i> (<code>cat notes.txt</code>). Shell request poori karta hai aur text mein jawab deta hai.</p>

<h3>Network engineer ko yeh kyun chahiye?</h3>
<p>Routers aur switches aapki duniya ka sirf aadha hissa hain. Baaki aadha Linux hai:</p>
<ul>
<li><b>Jump host (bastion).</b> Woh ek server jahan aap pehle SSH karte ho, aur wahan se har router par. Koi bhi laptop se seedha core router mein login nahi karta.</li>
<li><b>Syslog, TFTP, NTP aur monitoring servers.</b> Yeh router logs collect karte hain aur configuration backups plain files mein rakhte hain.</li>
<li><b>Automation host.</b> Python scripts, Ansible playbooks aur Git Linux box par rehte hain.</li>
<li><b>Network operating systems.</b> NX-OS, Arista EOS, Cumulus Linux, SONiC aur kai firewalls ke neeche Linux shell hota hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Laptop se jump host se devices">
<rect x="20" y="55" width="120" height="60" rx="10" fill="#e2e8f0"/><text x="80" y="82" text-anchor="middle" class="svg-ink" font-size="14">Aapka laptop</text><text x="80" y="102" text-anchor="middle" class="svg-muted" font-size="12">terminal</text>
<rect x="230" y="45" width="160" height="80" rx="10" fill="#bae6fd"/><text x="310" y="75" text-anchor="middle" class="svg-ink" font-size="14">NMS01 (Linux)</text><text x="310" y="95" text-anchor="middle" class="svg-muted" font-size="12">jump host + backups</text>
<rect x="490" y="15" width="130" height="40" rx="10" fill="#bbf7d0"/><text x="555" y="40" text-anchor="middle" class="svg-ink" font-size="13">Router R1</text>
<rect x="490" y="65" width="130" height="40" rx="10" fill="#bbf7d0"/><text x="555" y="90" text-anchor="middle" class="svg-ink" font-size="13">Router R2</text>
<rect x="490" y="115" width="130" height="40" rx="10" fill="#bbf7d0"/><text x="555" y="140" text-anchor="middle" class="svg-ink" font-size="13">Switch SW1</text>
<line x1="140" y1="85" x2="230" y2="85" stroke="#64748b" stroke-width="2"/><text x="185" y="78" text-anchor="middle" class="svg-accent" font-size="12">SSH</text>
<line x1="390" y1="75" x2="490" y2="35" stroke="#64748b" stroke-width="2"/><line x1="390" y1="85" x2="490" y2="85" stroke="#64748b" stroke-width="2"/><line x1="390" y1="95" x2="490" y2="135" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Linux jump host aapke aur network devices ke beech baitha hai.</p></div>

<h3>Woh words jo aapko pata hone chahiye</h3>
<dl class="terms">
<dt>Terminal</dt><dd>Woh window jahan aap type karte ho. Yeh sirf text dikhati hai.</dd>
<dt>Shell</dt><dd>Woh program jo aapka type kiya padhkar chalata hai. Ubuntu par yeh <b>bash</b> hai.</dd>
<dt>Command</dt><dd>Ek program jo aap shell se chalwate ho, jaise <code>ls</code>.</dd>
<dt>Option (flag)</dt><dd>Ek switch jo command ka kaam badalta hai, dash ke saath likhte hain: <code>-l</code>.</dd>
<dt>Argument</dt><dd>Jis par command kaam karta hai, jaise file ya directory ka naam.</dd>
</dl>
<p>Har command ka shape ek jaisa hai: <code>command  options  arguments</code>. Jaise <code>ls -l /var/log</code> ka matlab: <code>ls</code> chalao, option <code>-l</code> (long format) ke saath, directory <code>/var/log</code> par. Parts ko space alag karta hai. <b>Linux case-sensitive hai</b>: <code>Notes.txt</code> aur <code>notes.txt</code> do alag files hain.</p>

<h3>Aapka lab server</h3>
<p>Labs ek simulated <b>Ubuntu 24.04</b> server par chalti hain jiska naam <b>NMS01</b> hai, Deccan Net NOC ka monitoring server. Aap <code>netadmin</code> se login karte ho. Yeh educational simulation hai, par commands aur messages real Ubuntu jaise hain. Yeh rahe aapke pehle chaar commands, simulator ke real output ke saath:</p>
<pre class="code">netadmin@nms01:~$ whoami
netadmin
netadmin@nms01:~$ hostname
nms01
netadmin@nms01:~$ pwd
/home/netadmin
netadmin@nms01:~$ ls
incoming</pre>
<p><code>whoami</code> batata hai aap kaunse user ho, <code>hostname</code> server ka naam, <code>pwd</code> aap kis directory mein khade ho, aur <code>ls</code> uske andar ki list. Aaj sirf ek folder, <code>incoming</code>, hai.</p>
<pre class="out">netadmin@nms01:~$ uname -a
Linux nms01 6.8.0-45-generic #45-Ubuntu SMP PREEMPT_DYNAMIC Fri Aug 30 12:02:04 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux</pre>
<p><code>uname -a</code> kernel (operating system ka core) dikhata hai. Ubuntu 24.04 mein 6.8 kernel aata hai.</p>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) Command galat case mein type karna: real server par <code>LS</code>, <code>ls</code> nahi hai. (2) Undo ki ummeed. Linux mein recycle bin nahi aur "are you sure" nahi. Enter dabane se pehle command padho. (3) Terminal se darna. <code>ls</code>, <code>cat</code> aur <code>pwd</code> jaise reading commands kuch nahi bigaad sakte.</p></div>
<div class="exam"><p><b>Exam aur interview trap.</b> "Linux" kernel hai; Ubuntu, Debian, RHEL aur Rocky <b>distributions</b> hain jo use package karti hain. Is track ke commands sab par chalte hain. Jahan Ubuntu/Debian aur RHEL-family alag hain (package manager, firewall tool, user group ke naam) wahan chapter batata hai.</p></div>

<div class="scn"><h4>Raat 2 baje, ek config chahiye</h4><p>Pune ka ek core router crash hua aur badla gaya. On-call engineer ke laptop par uski config ki copy nahi thi. Usne jump host par SSH kiya, backup folder mein <code>ls</code> chalaya, aur kal raat ki file seconds mein mil gayi. Usne use TFTP folder mein copy kiya aur naya router paanch minute mein config load kar gaya. Jo colleague Linux nahi jaanta woh kisi ke jaagne ka intezaar karta rehta.</p><p><b>Lesson:</b> backups tabhi kaam ke hain jab aap unhe Linux server par dhoondh aur padh sako.</p></div>

<div class="iv"><p class="q">"Network engineer ko Linux kyun aani chahiye?"</p><p>Kyunki zyadatar supporting infrastructure usi par chalta hai: jump hosts, syslog aur TFTP servers, monitoring, automation tools aur network operating systems khud. Teen roz ke kaam batao: log padhna, config backup dhoondhna, aur dekhna ki kisne file badli. Yeh bhi kaho ki aap comfortable ho, administrator nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Terminal text dikhata hai; shell (bash) aapke commands chalata hai.</li>
<li>Command ka shape <code>command options arguments</code> hai.</li>
<li>Linux case-sensitive hai aur usme recycle bin nahi hota.</li>
<li>Jump hosts, syslog, TFTP aur automation boxes Linux servers hain.</li>
<li>Lab server Ubuntu 24.04 NMS01 hai, user netadmin.</li>
</ul></div>
`}};export{e as default};