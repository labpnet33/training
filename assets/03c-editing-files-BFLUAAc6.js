var e={id:`editing-files`,h:{en:`Editing a file on a server: nano first, vim survival`,hi:`Server par file edit karna: pehle nano, phir vim survival`},body:{en:`
<p>Sooner or later a Linux server asks you to edit a file: a netplan file, a cron table, the sudoers list, a script. There is no mouse and no Notepad. This chapter teaches the one skill every other Linux, Python and Ansible module quietly relies on: <b>opening a text file, changing it, saving it and getting out</b>.</p>

<h3>Analogy: Notepad that lives inside the terminal</h3>
<p>A <b>text editor</b> is Notepad without the window. You type its name and a file name, the terminal turns into a page of text, you type, then you tell it to save and close. The easiest editor on Ubuntu is <b>nano</b>. The older, more powerful one is <b>vim</b> (also called <code>vi</code>). You must know nano well and be able to <i>escape</i> from vim, because some commands open vim without asking you.</p>

<h3>nano: the friendly editor</h3>
<pre class="code">netadmin@nms01:~$ nano notes.txt</pre>
<p>If <code>notes.txt</code> does not exist, nano opens an empty page and creates the file when you save. You see your text in the middle and a help bar at the bottom. In that bar, <code>^</code> means the <b>Ctrl</b> key, so <code>^X</code> is Ctrl+X.</p>
<pre class="out">  GNU nano 7.2                      notes.txt
Backup job runs at 01:30 every night.

^G Help      ^O Write Out   ^W Where Is    ^K Cut
^X Exit      ^R Read File   ^U Paste       ^C Location</pre>
<table class="cmp">
<tr><th>You want to</th><th>Press</th></tr>
<tr><td>Type text</td><td>Just type. The arrow keys move the cursor.</td></tr>
<tr><td>Save the file</td><td><b>Ctrl+O</b>, then Enter to confirm the file name</td></tr>
<tr><td>Quit</td><td><b>Ctrl+X</b>. If there are unsaved changes it asks: press <b>Y</b> to save or <b>N</b> to throw the changes away</td></tr>
<tr><td>Cut a whole line</td><td>Ctrl+K</td></tr>
<tr><td>Paste it back</td><td>Ctrl+U</td></tr>
<tr><td>Search for a word</td><td>Ctrl+W, type the word, Enter</td></tr>
</table>
<p>That is the whole survival list: <b>type, Ctrl+O, Enter, Ctrl+X</b>.</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Open, type, save, exit">
<rect x="15" y="35" width="130" height="60" rx="10" fill="#bae6fd"/><text x="80" y="62" text-anchor="middle" class="svg-ink" font-size="13">1 Open</text><text x="80" y="80" text-anchor="middle" class="svg-muted" font-size="12">nano file</text>
<rect x="175" y="35" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="240" y="62" text-anchor="middle" class="svg-ink" font-size="13">2 Type</text><text x="240" y="80" text-anchor="middle" class="svg-muted" font-size="12">change the text</text>
<rect x="335" y="35" width="130" height="60" rx="10" fill="#fde68a"/><text x="400" y="62" text-anchor="middle" class="svg-ink" font-size="13">3 Save</text><text x="400" y="80" text-anchor="middle" class="svg-muted" font-size="12">Ctrl+O, Enter</text>
<rect x="495" y="35" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="560" y="62" text-anchor="middle" class="svg-ink" font-size="13">4 Exit</text><text x="560" y="80" text-anchor="middle" class="svg-muted" font-size="12">Ctrl+X</text>
<line x1="145" y1="65" x2="175" y2="65" stroke="#64748b" stroke-width="2"/><line x1="305" y1="65" x2="335" y2="65" stroke="#64748b" stroke-width="2"/><line x1="465" y1="65" x2="495" y2="65" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The four steps of every edit in nano.</p></div>

<h3>vim: how to escape</h3>
<p>vim works in <b>modes</b>. When it opens you are in <b>normal mode</b>: keys are commands, not letters, so typing text appears to do nothing or does strange things. This is why beginners panic. Learn only these:</p>
<ol>
<li>Press <code>i</code> to enter <b>insert mode</b>. Now you can type. The bottom line shows <code>-- INSERT --</code>.</li>
<li>Press <code>Esc</code> to go back to normal mode.</li>
<li>Type <code>:wq</code> and press Enter to <b>write and quit</b>.</li>
<li>Type <code>:q!</code> and press Enter to <b>quit and throw away</b> all changes.</li>
</ol>
<p>If you are lost, press <code>Esc</code> twice, then type <code>:q!</code> and Enter. You are out, and nothing was saved.</p>

<h3>Which editor will I get?</h3>
<p>Commands such as <code>crontab -e</code> (your scheduled jobs) and <code>sudo visudo</code> (the sudoers list) open the system's default editor. On Ubuntu that is usually nano, but on a server someone else built it may be vim. Check the first screen. To choose your own, run:</p>
<pre class="code">netadmin@nms01:~$ select-editor</pre>
<p>It shows a numbered list and you pick nano. This is an Ubuntu and Debian helper; on other distributions you set the <code>EDITOR</code> variable instead.</p>
<div class="note"><p><b>Labs.</b> The simulated server has no screen, so the labs create and fix files with commands such as <code>write</code>, <code>edit</code> and <code>sed -i</code>. Treat nano and vim as the real-world version of the same job. On a real server you will use nano.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Typing in vim before pressing <code>i</code>. (2) Closing the terminal window in panic: vim leaves a hidden swap file and the next person sees a scary warning. (3) Editing a system file without <code>sudo</code>: nano opens, you type, and saving fails with <i>Permission denied</i>. Reopen it with <code>sudo nano</code>. (4) Pasting tab characters into a YAML file. Use spaces.</p></div>
<div class="exam"><p><b>Interview trap.</b> If asked how you quit vim, answer <code>Esc</code>, then <code>:q!</code> to discard or <code>:wq</code> to save. Saying "I close the window" shows you have never worked on a production server.</p></div>

<div class="scn"><h4>The backup job that never ran</h4><p>A new engineer ran <code>crontab -e</code> to schedule the nightly router backup. The server dropped him into vim. He typed the schedule line, but nothing looked right, so he closed the terminal. No job was saved, and nobody noticed until a router failed three weeks later and there was no recent backup.</p><p><b>Lesson:</b> know your editor before you need it, and always run <code>crontab -l</code> afterwards to confirm the change was saved.</p></div>

<div class="iv"><p class="q">"How do you edit a configuration file on a Linux server?"</p><p>A strong answer: open it with nano (or vim if that is all the server has), make the change, save, and then validate and reload the service. Mention taking a copy first with <code>cp file file.bak</code> and using <code>sudo</code> only for files you must change as root.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>nano is the beginner editor: type, Ctrl+O, Enter, Ctrl+X.</li>
<li>vim has modes: press i to type, Esc then :wq to save, Esc then :q! to discard.</li>
<li>crontab -e and visudo open the default editor, which may be vim.</li>
<li>Use sudo only when the file belongs to root, and copy it first.</li>
<li>Spaces, not tabs, in YAML files.</li>
</ul></div>
`,hi:`
<p>Kabhi na kabhi Linux server aapse file edit karwayega: netplan file, cron table, sudoers list, koi script. Wahan mouse nahi hota aur Notepad nahi hota. Yeh chapter woh ek skill sikhata hai jis par baaki har Linux, Python aur Ansible module chupchaap depend karta hai: <b>text file kholna, badalna, save karna aur bahar aana</b>.</p>

<h3>Analogy: Notepad jo terminal ke andar rehta hai</h3>
<p><b>Text editor</b> bina window wala Notepad hai. Aap uska naam aur file ka naam type karte ho, terminal text ke page mein badal jaata hai, aap type karte ho, phir save aur close karne ko kehte ho. Ubuntu par sabse aasaan editor <b>nano</b> hai. Purana aur zyada powerful editor <b>vim</b> (jise <code>vi</code> bhi kehte hain). Aapko nano achhe se aana chahiye aur vim se <i>bachkar nikalna</i> aana chahiye, kyunki kuch commands bina poochhe vim khol dete hain.</p>

<h3>nano: friendly editor</h3>
<pre class="code">netadmin@nms01:~$ nano notes.txt</pre>
<p>Agar <code>notes.txt</code> exist nahi karti, to nano khaali page kholta hai aur save karte hi file bana deta hai. Beech mein aapka text dikhta hai aur neeche help bar. Us bar mein <code>^</code> ka matlab <b>Ctrl</b> key hai, yaani <code>^X</code> matlab Ctrl+X.</p>
<pre class="out">  GNU nano 7.2                      notes.txt
Backup job runs at 01:30 every night.

^G Help      ^O Write Out   ^W Where Is    ^K Cut
^X Exit      ^R Read File   ^U Paste       ^C Location</pre>
<table class="cmp">
<tr><th>Aap kya karna chahte ho</th><th>Kya dabao</th></tr>
<tr><td>Text type karna</td><td>Bas type karo. Arrow keys cursor hilati hain.</td></tr>
<tr><td>File save karna</td><td><b>Ctrl+O</b>, phir file ka naam confirm karne ke liye Enter</td></tr>
<tr><td>Bahar nikalna</td><td><b>Ctrl+X</b>. Unsaved changes hon to woh poochta hai: save ke liye <b>Y</b>, changes phenkne ke liye <b>N</b></td></tr>
<tr><td>Poori line cut karna</td><td>Ctrl+K</td></tr>
<tr><td>Wapas paste karna</td><td>Ctrl+U</td></tr>
<tr><td>Word dhoondhna</td><td>Ctrl+W, word type karo, Enter</td></tr>
</table>
<p>Bas itni hi survival list hai: <b>type, Ctrl+O, Enter, Ctrl+X</b>.</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Kholo, type karo, save karo, bahar nikalo">
<rect x="15" y="35" width="130" height="60" rx="10" fill="#bae6fd"/><text x="80" y="62" text-anchor="middle" class="svg-ink" font-size="13">1 Kholo</text><text x="80" y="80" text-anchor="middle" class="svg-muted" font-size="12">nano file</text>
<rect x="175" y="35" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="240" y="62" text-anchor="middle" class="svg-ink" font-size="13">2 Type karo</text><text x="240" y="80" text-anchor="middle" class="svg-muted" font-size="12">text badlo</text>
<rect x="335" y="35" width="130" height="60" rx="10" fill="#fde68a"/><text x="400" y="62" text-anchor="middle" class="svg-ink" font-size="13">3 Save</text><text x="400" y="80" text-anchor="middle" class="svg-muted" font-size="12">Ctrl+O, Enter</text>
<rect x="495" y="35" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="560" y="62" text-anchor="middle" class="svg-ink" font-size="13">4 Exit</text><text x="560" y="80" text-anchor="middle" class="svg-muted" font-size="12">Ctrl+X</text>
<line x1="145" y1="65" x2="175" y2="65" stroke="#64748b" stroke-width="2"/><line x1="305" y1="65" x2="335" y2="65" stroke="#64748b" stroke-width="2"/><line x1="465" y1="65" x2="495" y2="65" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">nano mein har edit ke chaar steps.</p></div>

<h3>vim: bachkar kaise nikalein</h3>
<p>vim <b>modes</b> mein kaam karta hai. Khulte hi aap <b>normal mode</b> mein hote ho: keys letters nahi, commands hoti hain, isliye type karne par kuch nahi hota ya ajeeb cheezein hoti hain. Isi wajah se beginners ghabra jaate hain. Sirf yeh seekho:</p>
<ol>
<li><code>i</code> dabao, <b>insert mode</b> shuru. Ab aap type kar sakte ho. Neeche ki line mein <code>-- INSERT --</code> dikhta hai.</li>
<li><code>Esc</code> dabao, wapas normal mode.</li>
<li><code>:wq</code> type karo aur Enter dabao, <b>write aur quit</b>.</li>
<li><code>:q!</code> type karo aur Enter dabao, <b>quit aur saare changes phenk do</b>.</li>
</ol>
<p>Kho gaye ho to <code>Esc</code> do baar dabao, phir <code>:q!</code> aur Enter. Aap bahar ho, aur kuch save nahi hua.</p>

<h3>Mujhe kaunsa editor milega?</h3>
<p><code>crontab -e</code> (aapke scheduled jobs) aur <code>sudo visudo</code> (sudoers list) jaise commands system ka default editor kholte hain. Ubuntu par aam taur par nano hota hai, lekin kisi aur ke banaye server par vim ho sakta hai. Pehli screen dekho. Apna editor chunne ke liye chalao:</p>
<pre class="code">netadmin@nms01:~$ select-editor</pre>
<p>Woh numbered list dikhata hai aur aap nano chunte ho. Yeh Ubuntu aur Debian ka helper hai; doosri distributions par aap <code>EDITOR</code> variable set karte ho.</p>
<div class="note"><p><b>Labs.</b> Simulated server mein screen nahi hai, isliye labs files <code>write</code>, <code>edit</code> aur <code>sed -i</code> jaise commands se banati aur theek karti hain. nano aur vim ko usi kaam ka real-world version samjho. Real server par aap nano use karoge.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) vim mein <code>i</code> dabaye bina type karna. (2) Ghabrakar terminal window band kar dena: vim ek hidden swap file chhod deta hai aur agla bande ko daravna warning dikhta hai. (3) <code>sudo</code> ke bina system file edit karna: nano khulta hai, aap type karte ho, aur save <i>Permission denied</i> se fail hota hai. <code>sudo nano</code> se dobara kholo. (4) YAML file mein tab characters paste karna. Spaces use karo.</p></div>
<div class="exam"><p><b>Interview trap.</b> Poochhe ki vim se kaise nikalte ho, to jawab do <code>Esc</code>, phir discard ke liye <code>:q!</code> ya save ke liye <code>:wq</code>. "Main window band kar deta hoon" kehna dikhata hai ki aapne kabhi production server par kaam nahi kiya.</p></div>

<div class="scn"><h4>Woh backup job jo kabhi chala hi nahi</h4><p>Ek naye engineer ne raat ka router backup schedule karne ke liye <code>crontab -e</code> chalaya. Server ne use vim mein daal diya. Usne schedule line type ki, lekin kuch theek nahi laga, to usne terminal band kar diya. Koi job save nahi hua, aur kisi ko pata nahi chala jab tak teen hafte baad router fail nahi hua aur koi recent backup nahi tha.</p><p><b>Lesson:</b> editor ko tab seekho jab zaroorat na ho, aur baad mein hamesha <code>crontab -l</code> chalakar confirm karo ki change save hua.</p></div>

<div class="iv"><p class="q">"Linux server par configuration file kaise edit karte ho?"</p><p>Strong jawab: nano se kholo (ya vim agar server par wahi hai), change karo, save karo, phir service ko validate aur reload karo. Yeh bhi batao ki pehle <code>cp file file.bak</code> se copy lete ho aur <code>sudo</code> sirf unhi files ke liye use karte ho jo root ki hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>nano beginner editor hai: type, Ctrl+O, Enter, Ctrl+X.</li>
<li>vim mein modes hain: i se type, Esc phir :wq se save, Esc phir :q! se discard.</li>
<li>crontab -e aur visudo default editor kholte hain, jo vim ho sakta hai.</li>
<li>sudo sirf tab jab file root ki ho, aur pehle copy lo.</li>
<li>YAML files mein tabs nahi, spaces.</li>
</ul></div>
`}};export{e as default};