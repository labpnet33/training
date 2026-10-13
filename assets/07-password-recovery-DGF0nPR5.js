var e={id:`password-recovery`,h:{en:`Root password recovery and protecting the console`,hi:`Root password recovery aur console ki suraksha`},body:{en:`
<p>One day you will inherit a router that nobody can log in to. The previous owner left, the password was never written down, and the device is in a cupboard in a branch. Junos has a recovery procedure for exactly this, and it is on the exam. It works because of one security principle you must remember: <b>physical access equals control</b>. Whoever can plug into the console port and reboot the device can reset the password.</p>

<h3>Analogy: the lost house key</h3>
<p>If you lock yourself out of your own house, a locksmith can get you in, but only if you can stand at the door and prove it is your house. The console port is that door. Recovery does not erase your furniture (the configuration); it only changes the lock (the root password).</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Recovery steps">
<rect x="20" y="10" width="280" height="40" rx="8" fill="#bae6fd"/><text x="160" y="35" text-anchor="middle" class="svg-ink" font-size="12">1. Console cable in, reboot device</text>
<rect x="20" y="62" width="280" height="40" rx="8" fill="#ddd6fe"/><text x="160" y="87" text-anchor="middle" class="svg-ink" font-size="12">2. Press space at boot prompt</text>
<rect x="20" y="114" width="280" height="40" rx="8" fill="#fde68a"/><text x="160" y="139" text-anchor="middle" class="svg-ink" font-size="12">3. loader&gt; boot -s (single-user)</text>
<rect x="340" y="10" width="280" height="40" rx="8" fill="#fed7aa"/><text x="480" y="35" text-anchor="middle" class="svg-ink" font-size="12">4. Shell prompt: type recovery</text>
<rect x="340" y="62" width="280" height="40" rx="8" fill="#bbf7d0"/><text x="480" y="87" text-anchor="middle" class="svg-ink" font-size="12">5. configure, set root password</text>
<rect x="340" y="114" width="280" height="40" rx="8" fill="#e2e8f0"/><text x="480" y="139" text-anchor="middle" class="svg-ink" font-size="12">6. commit, exit, answer y to reboot</text>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="13">Defence: console ports must be physically secured</text>
<text x="320" y="212" text-anchor="middle" class="svg-muted" font-size="12">or set console insecure so single-user mode asks for the password</text>
</svg><p class="cap">Six steps. Nothing else in the configuration changes.</p></div>

<h3>The procedure</h3>
<ol>
<li>Connect a laptop to the <b>console port</b> and reboot the device. If you cannot log in to reboot it cleanly, power-cycle it.</li>
<li>Interrupt the boot. When you see "Hit [Enter] to boot immediately, or space bar for command prompt", press the <b>space bar</b>. Some newer platforms offer a boot menu where you pick the recovery or single-user option instead.</li>
<li>At the <code>loader&gt;</code> prompt type <code>boot -s</code>. This boots <b>single-user mode</b>, a minimal start with no network and no normal login.</li>
<li>When asked for the shell, type <code>recovery</code>. Junos starts its recovery script and drops you into the CLI as root.</li>
<li>Enter configuration mode and set the new password:</li>
</ol>
<pre class="code">root&gt; configure
root# set system root-authentication plain-text-password
New password: ********
Retype new password: ********
root# commit
commit complete
root# exit
root&gt; exit
Reboot the system? [y/n] y</pre>
<ol start="6"><li>Answer <b>y</b> and let the device boot normally. Log in as root with the new password.</li></ol>
<p>Junos stores the password as a hash. If you prefer to paste a ready-made hash, use <code>set system root-authentication encrypted-password "hash"</code>, as the lab start-up files do. A Junos device without a root password is not allowed to commit configuration, so setting one is the first job on any new box.</p>

<h3>The defence: console insecure</h3>
<p>Recovery depends on single-user mode not asking for a password. If you configure:</p>
<pre class="code">set system ports console insecure</pre>
<p>then single-user mode asks for the root password, the procedure stops, and a lost password means the device must be reinstalled from media (or returned to the factory state). Use this on devices in shared or unsafe locations. The trade-off is simple: more security, but a real recovery cost if you lose the password. Keep the password in a company vault.</p>
<div class="note"><p><b>Simulator note.</b> The simulated device cannot boot into single-user mode, so you cannot practise this procedure at the prompt. Learn the sequence and be ready to answer it in the quiz and the exam.</p></div>

<div class="warn"><p><b>Common mistake.</b> Typing <code>boot -s</code> and then waiting for a password prompt, or forgetting to <code>commit</code> before exit. Without the commit the new password is lost on reboot.</p></div>
<div class="exam"><p><b>Exam trap.</b> Remember the pair: <code>boot -s</code> at the loader prompt, <code>recovery</code> at the shell question. And remember that the setting that blocks this procedure is <code>console insecure</code>, which sounds as if it makes things worse but actually protects the device.</p></div>

<div class="scn"><h4>The inherited branch router</h4><p>A company acquired a small business. Its router held the only link to the shop's server, and nobody knew the root password. The network engineer travelled to the site, connected a console cable, followed the six steps, set a new root password, committed and rebooted. The configuration was unchanged and the shop never lost its VPN. Afterwards he stored the password in the vault, created named user accounts, and set the console to insecure because the router sat in a public back office.</p><p><b>Lesson:</b> recovery is easy for anyone at the console, so secure the room and the console port, not just the password.</p></div>

<div class="iv"><p class="q">"You inherit a Junos router and do not know the root password. What do you do, and how could it be prevented?"</p><p>Get physical console access, reboot, break into the loader with the space bar, boot -s for single-user mode, type recovery, configure a new root password, commit and reboot. Prevention: physical security of the console, and set system ports console insecure so single-user mode demands the password. State the trade-off: with insecure set, a forgotten password needs a reinstall.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Recovery needs physical console access; it changes only the root password.</li>
<li>Sequence: reboot, space bar, boot -s, recovery, configure, set root password, commit, exit, reboot.</li>
<li>Junos refuses to commit without a root password on a new device.</li>
<li>set system ports console insecure makes single-user mode ask for the root password.</li>
<li>Keep passwords in a vault and secure console ports physically.</li>
</ul></div>
`,hi:`
<p>Ek din aapko aisa router milega jisme koi login nahi kar sakta. Pichla owner chala gaya, password kahin likha nahi tha, aur device ek branch ki almari mein hai. Junos mein iske liye recovery procedure hai, aur yeh exam mein aata hai. Yeh ek security principle ki wajah se chalta hai jo yaad rakhna: <b>physical access matlab control</b>. Jo koi console port mein plug karke device reboot kar sakta hai woh password reset kar sakta hai.</p>

<h3>Analogy: ghar ki khoyi chaabi</h3>
<p>Apne hi ghar se bahar lock ho jao to taala kholne wala andar aane de sakta hai, lekin tabhi jab aap darwaze par khade hoke saabit karo ki ghar aapka hai. Console port woh darwaza hai. Recovery aapka furniture (configuration) nahi mitati; sirf taala (root password) badalti hai.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Recovery steps">
<rect x="20" y="10" width="280" height="40" rx="8" fill="#bae6fd"/><text x="160" y="35" text-anchor="middle" class="svg-ink" font-size="12">1. Console cable lagao, device reboot</text>
<rect x="20" y="62" width="280" height="40" rx="8" fill="#ddd6fe"/><text x="160" y="87" text-anchor="middle" class="svg-ink" font-size="12">2. Boot prompt par space dabao</text>
<rect x="20" y="114" width="280" height="40" rx="8" fill="#fde68a"/><text x="160" y="139" text-anchor="middle" class="svg-ink" font-size="12">3. loader&gt; boot -s (single-user)</text>
<rect x="340" y="10" width="280" height="40" rx="8" fill="#fed7aa"/><text x="480" y="35" text-anchor="middle" class="svg-ink" font-size="12">4. Shell prompt: recovery likho</text>
<rect x="340" y="62" width="280" height="40" rx="8" fill="#bbf7d0"/><text x="480" y="87" text-anchor="middle" class="svg-ink" font-size="12">5. configure, root password set</text>
<rect x="340" y="114" width="280" height="40" rx="8" fill="#e2e8f0"/><text x="480" y="139" text-anchor="middle" class="svg-ink" font-size="12">6. commit, exit, reboot ke liye y</text>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="13">Bachaav: console ports physically secure karo</text>
<text x="320" y="212" text-anchor="middle" class="svg-muted" font-size="12">ya console insecure set karo taaki single-user mode password maange</text>
</svg><p class="cap">Chhe steps. Configuration mein aur kuch nahi badalta.</p></div>

<h3>Procedure</h3>
<ol>
<li>Laptop ko <b>console port</b> se jodo aur device reboot karo. Agar login hokar clean reboot nahi kar sakte to power-cycle karo.</li>
<li>Boot rokho. Jab "Hit [Enter] to boot immediately, or space bar for command prompt" dikhe to <b>space bar</b> dabao. Kuch naye platforms boot menu dete hain jahan se recovery ya single-user option chunte ho.</li>
<li><code>loader&gt;</code> prompt par <code>boot -s</code> likho. Yeh <b>single-user mode</b> mein boot karta hai, ek minimal start jisme network aur normal login nahi hota.</li>
<li>Shell ke baare mein poocha jaaye to <code>recovery</code> likho. Junos recovery script chalata hai aur aapko root ke roop mein CLI mein le aata hai.</li>
<li>Configuration mode mein jao aur naya password set karo:</li>
</ol>
<pre class="code">root&gt; configure
root# set system root-authentication plain-text-password
New password: ********
Retype new password: ********
root# commit
commit complete
root# exit
root&gt; exit
Reboot the system? [y/n] y</pre>
<ol start="6"><li><b>y</b> likho aur device ko normally boot hone do. Naye password se root login karo.</li></ol>
<p>Junos password hash ke roop mein store karta hai. Ready-made hash paste karna ho to <code>set system root-authentication encrypted-password "hash"</code> use karo, jaisa lab start-up files karti hain. Root password ke bina Junos device configuration commit nahi karne deta, isliye naye box par pehla kaam yahi hai.</p>

<h3>Bachaav: console insecure</h3>
<p>Recovery is par tikti hai ki single-user mode password nahi maangta. Agar aap configure karo:</p>
<pre class="code">set system ports console insecure</pre>
<p>to single-user mode root password maangta hai, procedure ruk jaata hai, aur password kho jaaye to device ko media se reinstall karna padta hai (ya factory state mein bhejna padta hai). Shared ya unsafe jagah ke devices par yeh use karo. Trade-off seedha hai: zyada security, lekin password kho gaya to asli recovery cost. Password company vault mein rakho.</p>
<div class="note"><p><b>Simulator note.</b> Simulated device single-user mode mein boot nahi kar sakta, isliye is procedure ko prompt par practice nahi kar sakte. Sequence seekho aur quiz aur exam mein jawab dene ke liye taiyaar raho.</p></div>

<div class="warn"><p><b>Common mistake.</b> <code>boot -s</code> likhkar password prompt ka intezaar karna, ya exit se pehle <code>commit</code> bhool jaana. Commit ke bina naya password reboot par ud jaata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Jodi yaad rakho: loader prompt par <code>boot -s</code>, shell sawaal par <code>recovery</code>. Aur jo setting is procedure ko rokti hai woh <code>console insecure</code> hai, jo sunne mein lagta hai halat kharab karti hai par asal mein device ko protect karti hai.</p></div>

<div class="scn"><h4>Virasat mein mila branch router</h4><p>Ek company ne chhota business acquire kiya. Uska router shop ke server ka akela link tha aur root password kisi ko nahi pata tha. Network engineer site par gaya, console cable lagaya, chhe steps follow kiye, naya root password set kiya, commit karke reboot kiya. Configuration waisi hi rahi aur shop ka VPN kabhi gira nahi. Baad mein usne password vault mein rakha, named user accounts banaye, aur console insecure set kiya kyunki router public back office mein tha.</p><p><b>Lesson:</b> console par baitha koi bhi recovery aasani se kar sakta hai, isliye sirf password nahi, kamra aur console port secure karo.</p></div>

<div class="iv"><p class="q">"Aapko Junos router mila jiska root password nahi pata. Kya karoge, aur ise kaise roka ja sakta hai?"</p><p>Physical console access lo, reboot karo, space bar se loader mein jao, single-user mode ke liye boot -s, recovery likho, naya root password configure karo, commit aur reboot. Prevention: console ki physical security, aur set system ports console insecure taaki single-user mode password maange. Trade-off batao: insecure set ho aur password bhool jao to reinstall karna padega.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Recovery ke liye physical console access chahiye; yeh sirf root password badalti hai.</li>
<li>Sequence: reboot, space bar, boot -s, recovery, configure, root password set, commit, exit, reboot.</li>
<li>Naye device par root password ke bina Junos commit refuse karta hai.</li>
<li>set system ports console insecure single-user mode ko root password maangne par majboor karta hai.</li>
<li>Passwords vault mein rakho aur console ports ko physically secure karo.</li>
</ul></div>
`}};export{e as default};