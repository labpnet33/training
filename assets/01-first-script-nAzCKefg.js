var e={id:`first-script`,h:{en:`Welcome: your first Bash script and the big picture`,hi:`Swagat: aapki pehli Bash script aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will turn the Linux commands you already know into small, reliable scripts: variables, arguments, decisions, loops over a list of devices, exit codes, a nightly backup and a cron schedule that runs it for you. By the end you can write, fix and schedule a script that pings every router in a list and saves a dated report. No coding experience is needed. Every line is explained.</p>
<p><b>Prerequisites.</b> You should be comfortable with <code>cd</code>, <code>ls</code>, <code>cat</code>, <code>chmod</code> and file permissions from the earlier Linux modules (shell and file system, users and permissions). If you can type a command, you can write a script.</p>

<h3>Analogy: a script is a checklist you hand to a very literal colleague</h3>
<p>Imagine every morning you check ten routers: ping each one, note which are down, write the result in a file. You could do it by hand for years. Or you could write the steps on a card and hand the card to a colleague who follows it exactly, never gets bored and never skips line seven. A <b>script</b> is that card: a plain text file that holds commands in order. The colleague is <b>Bash</b>, the program that reads the card and runs each line. Bash does exactly what is written, so the card must be exact.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="From script file to running commands">
<rect x="20" y="40" width="170" height="80" rx="10" fill="#fde68a"/><text x="105" y="72" text-anchor="middle" class="svg-ink" font-size="14">hello.sh</text><text x="105" y="94" text-anchor="middle" class="svg-muted" font-size="12">text file with commands</text>
<rect x="235" y="40" width="170" height="80" rx="10" fill="#bae6fd"/><text x="320" y="72" text-anchor="middle" class="svg-ink" font-size="14">bash</text><text x="320" y="94" text-anchor="middle" class="svg-muted" font-size="12">reads one line at a time</text>
<rect x="450" y="40" width="170" height="80" rx="10" fill="#bbf7d0"/><text x="535" y="72" text-anchor="middle" class="svg-ink" font-size="14">commands run</text><text x="535" y="94" text-anchor="middle" class="svg-muted" font-size="12">echo, date, ping ...</text>
<line x1="190" y1="80" x2="235" y2="80" stroke="#64748b" stroke-width="2"/><line x1="405" y1="80" x2="450" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">the first line (#!/bin/bash) tells the system to hand the file to bash</text>
</svg><p class="cap">A script is only a text file until bash reads it.</p></div>

<h3>Your first script, line by line</h3>
<p>In the lab terminal on AUTO01 you write a file with <code>cat &gt; hello.sh &lt;&lt;'EOF'</code>, type the lines, and finish with a line that says only <code>EOF</code>. The file holds four lines:</p>
<pre class="code">#!/bin/bash
# hello.sh - my first script
echo "Hello from $(hostname)"
date</pre>
<ul>
<li><code>#!/bin/bash</code> is the <b>shebang</b>. The two characters <code>#!</code> followed by a program path tell Linux which program must run this file. Here that is Bash.</li>
<li>A line that starts with <code>#</code> is a <b>comment</b>. Bash ignores it. Comments are notes for the next human, who is often you in six months.</li>
<li><code>echo</code> prints text. <code>$(hostname)</code> runs the command <code>hostname</code> and pastes its answer into the text. You will study this in the next chapter.</li>
<li><code>date</code> prints the current date and time.</li>
</ul>

<h3>Making it executable and running it</h3>
<p>A new file is not allowed to run as a program. You grant that with <code>chmod +x</code>, which adds the <b>execute permission</b>. Then you run the script by its path. This is real output from the lab:</p>
<pre class="out">AUTO01$ ./hello.sh
-bash: ./hello.sh: <span class="hl">Permission denied</span>
AUTO01$ chmod +x hello.sh
AUTO01$ ./hello.sh
Hello from auto01
Tue Sep 29 09:00:30 IST 2026
AUTO01$ ls -l hello.sh
-rw<span class="hl">x</span>r-xr-x  1 netadmin netadmin     76 Sep 29 09:00 hello.sh
AUTO01$ hello.sh
hello.sh: command not found</pre>
<p>Read the permission string: the <code>x</code> characters appeared after <code>chmod +x</code>. Look at the last command. Typing only <code>hello.sh</code> fails with <i>command not found</i>. Linux searches for commands in the folders listed in the <code>PATH</code> variable, and your current folder is not on that list on purpose. The leading <code>./</code> means "the file in this folder", and that is why scripts are run as <code>./hello.sh</code>. You can also run <code>bash hello.sh</code>, which needs no execute permission because you hand the file to Bash yourself.</p>

<div class="eg"><p><b>Worked example.</b> Every morning at 09:00 you type three commands: <code>hostname</code>, <code>date</code>, <code>ping -c 1 10.99.0.1</code>. Put those three lines in <code>morning.sh</code>, run <code>chmod +x morning.sh</code> once, and from tomorrow you type <code>./morning.sh</code>. Three commands became one, and the result is the same every time. Later chapters add decisions and loops so the script can check forty devices.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Forgetting <code>chmod +x</code> (you get <i>Permission denied</i>). Typing <code>hello.sh</code> without <code>./</code> (you get <i>command not found</i>). Spaces before <code>#!</code> or a blank first line, so the shebang is not the very first characters of the file. Writing a script in a Windows editor that saves line endings the Linux way incorrectly; if you see strange <code>^M</code> errors, the file needs Unix line endings.</p></div>
<div class="exam"><p><b>Exam trap.</b> The shebang names an <i>interpreter</i> path. A script can run without it when you start it with <code>bash script.sh</code>, but then the system is not choosing the interpreter for you. Also remember: <code>chmod +x</code> is needed only for the <code>./script</code> style, not for <code>bash script</code>.</p></div>

<div class="scn"><h4>Forty pings, typed by hand</h4><p>A new NOC engineer pinged 40 branch routers one by one every Monday and pasted the results into a spreadsheet. It took 25 minutes and twice he skipped a router by mistake, so an outage was found late. His senior wrote a six-line script with the device list in a file. It ran in seconds, treated every router the same, and the engineer spent the saved time reading why the down devices were down.</p><p><b>Lesson:</b> scripts remove boring, error-prone repetition; the engineer keeps the thinking.</p></div>

<div class="iv"><p class="q">"What is the shebang and why do we need chmod +x?"</p><p>The shebang, <code>#!/bin/bash</code>, is the first line of a script and tells the kernel which interpreter should execute the file. <code>chmod +x</code> sets the execute permission so the file can be launched directly as <code>./script.sh</code>. Mention that the current directory is not in <code>PATH</code>, which is why you need <code>./</code>, and that <code>bash script.sh</code> works even without the execute bit.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A script is a text file of commands that Bash runs in order.</li>
<li>The first line <code>#!/bin/bash</code> names the interpreter; lines starting with <code>#</code> are comments.</li>
<li><code>chmod +x</code> makes it executable; run it as <code>./name.sh</code>.</li>
<li><i>Permission denied</i> means the execute bit is missing; <i>command not found</i> means the shell cannot find the file on PATH.</li>
<li>Scripts make daily checks fast, repeatable and the same every time.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap jo Linux commands pehle se jaante ho unhe chhoti, bharosemand scripts mein badlna seekhoge: variables, arguments, decisions, devices ki list par loops, exit codes, nightly backup aur cron schedule jo use aapke liye chalaye. Module ke end tak aap aisi script likh, theek aur schedule kar sakoge jo list ke har router ko ping kare aur date wali report save kare. Coding ka anubhav zaroori nahi. Har line samjhai jaayegi.</p>
<p><b>Prerequisites.</b> Pehle ke Linux modules (shell aur file system, users aur permissions) se <code>cd</code>, <code>ls</code>, <code>cat</code>, <code>chmod</code> aur file permissions aani chahiye. Agar aap command type kar sakte ho, to script likh sakte ho.</p>

<h3>Analogy: script ek checklist hai jo aap bahut literal colleague ko dete ho</h3>
<p>Socho roz subah aap das routers check karte ho: har ek ko ping, jo down ho uska note, result ek file mein. Yeh saalon haath se kar sakte ho. Ya phir steps ek card par likho aur card aise colleague ko do jo use bilkul waise follow kare, kabhi bore na ho aur saatvi line kabhi skip na kare. <b>Script</b> wahi card hai: plain text file jisme commands order mein hoti hain. Colleague <b>Bash</b> hai, woh program jo card padhta hai aur har line chalata hai. Bash bilkul wahi karta hai jo likha hai, isliye card bilkul sahi hona chahiye.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Script file se chalti commands tak">
<rect x="20" y="40" width="170" height="80" rx="10" fill="#fde68a"/><text x="105" y="72" text-anchor="middle" class="svg-ink" font-size="14">hello.sh</text><text x="105" y="94" text-anchor="middle" class="svg-muted" font-size="12">commands wali text file</text>
<rect x="235" y="40" width="170" height="80" rx="10" fill="#bae6fd"/><text x="320" y="72" text-anchor="middle" class="svg-ink" font-size="14">bash</text><text x="320" y="94" text-anchor="middle" class="svg-muted" font-size="12">ek ek line padhta hai</text>
<rect x="450" y="40" width="170" height="80" rx="10" fill="#bbf7d0"/><text x="535" y="72" text-anchor="middle" class="svg-ink" font-size="14">commands chalti hain</text><text x="535" y="94" text-anchor="middle" class="svg-muted" font-size="12">echo, date, ping ...</text>
<line x1="190" y1="80" x2="235" y2="80" stroke="#64748b" stroke-width="2"/><line x1="405" y1="80" x2="450" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">pehli line (#!/bin/bash) system ko batati hai ki file bash ko do</text>
</svg><p class="cap">Script tab tak sirf text file hai jab tak bash use padhe nahi.</p></div>

<h3>Aapki pehli script, line by line</h3>
<p>AUTO01 ke lab terminal mein aap <code>cat &gt; hello.sh &lt;&lt;'EOF'</code> se file likhte ho, lines type karte ho, aur aisi line se khatam karte ho jisme sirf <code>EOF</code> ho. File mein chaar lines hain:</p>
<pre class="code">#!/bin/bash
# hello.sh - my first script
echo "Hello from $(hostname)"
date</pre>
<ul>
<li><code>#!/bin/bash</code> <b>shebang</b> hai. <code>#!</code> aur uske baad program ka path Linux ko batata hai ki yeh file kaunsa program chalaye. Yahan woh Bash hai.</li>
<li><code>#</code> se shuru hone wali line <b>comment</b> hai. Bash use ignore karta hai. Comments agle insaan ke liye notes hain, jo aksar aap hi ho, chhe mahine baad.</li>
<li><code>echo</code> text print karta hai. <code>$(hostname)</code> command <code>hostname</code> chalakar uska jawab text mein laga deta hai. Iske baare mein agle chapter mein padhoge.</li>
<li><code>date</code> abhi ki date aur time print karta hai.</li>
</ul>

<h3>Executable banana aur chalana</h3>
<p>Nayi file ko program ki tarah chalne ki ijazat nahi hoti. Yeh ijazat <code>chmod +x</code> se milti hai, jo <b>execute permission</b> jodta hai. Phir script ko uske path se chalate ho. Yeh lab ka asli output hai:</p>
<pre class="out">AUTO01$ ./hello.sh
-bash: ./hello.sh: <span class="hl">Permission denied</span>
AUTO01$ chmod +x hello.sh
AUTO01$ ./hello.sh
Hello from auto01
Tue Sep 29 09:00:30 IST 2026
AUTO01$ ls -l hello.sh
-rw<span class="hl">x</span>r-xr-x  1 netadmin netadmin     76 Sep 29 09:00 hello.sh
AUTO01$ hello.sh
hello.sh: command not found</pre>
<p>Permission string padho: <code>chmod +x</code> ke baad <code>x</code> characters aa gaye. Aakhri command dekho. Sirf <code>hello.sh</code> likhne par <i>command not found</i> aata hai. Linux commands ko <code>PATH</code> variable mein likhe folders mein dhoondta hai, aur aapka current folder jaanbujhkar us list mein nahi hota. Aage ka <code>./</code> matlab "isi folder ki file", isliye scripts <code>./hello.sh</code> ki tarah chalti hain. <code>bash hello.sh</code> bhi chala sakte ho, jisme execute permission nahi chahiye kyunki file Bash ko aap khud dete ho.</p>

<div class="eg"><p><b>Worked example.</b> Roz subah 09:00 baje aap teen commands type karte ho: <code>hostname</code>, <code>date</code>, <code>ping -c 1 10.99.0.1</code>. Yeh teen lines <code>morning.sh</code> mein rakho, ek baar <code>chmod +x morning.sh</code> chalao, aur kal se <code>./morning.sh</code> type karo. Teen commands ek ban gayi, aur result har baar same hai. Aage ke chapters decisions aur loops jodte hain taaki script chalis devices check kare.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> <code>chmod +x</code> bhool jaana (<i>Permission denied</i> milta hai). <code>./</code> ke bina <code>hello.sh</code> type karna (<i>command not found</i> milta hai). <code>#!</code> se pehle space ya khaali pehli line, jisse shebang file ke bilkul pehle characters nahi rehte. Windows editor mein script likhna jo line endings Linux ke tareeke se galat save kare; agar ajeeb <code>^M</code> errors dikhein to file ko Unix line endings chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> Shebang ek <i>interpreter</i> ka path batata hai. Script uske bina bhi <code>bash script.sh</code> se chal sakti hai, par tab system interpreter aapke liye choose nahi kar raha. Yaad rakho: <code>chmod +x</code> sirf <code>./script</code> style ke liye chahiye, <code>bash script</code> ke liye nahi.</p></div>

<div class="scn"><h4>Chalis pings, haath se type kiye</h4><p>Ek naye NOC engineer ne har Monday 40 branch routers ko ek ek karke ping kiya aur results spreadsheet mein paste kiye. 25 minute lagte the aur do baar galti se ek router chhoot gaya, isliye outage der se pakda gaya. Uske senior ne chhe line ki script likhi jisme device list ek file mein thi. Woh seconds mein chali, har router ke saath ek jaisa behave kiya, aur engineer ne bachaya hua time yeh padhne mein lagaya ki down devices kyun down hain.</p><p><b>Lesson:</b> scripts boring, galti-prone repetition hata deti hain; sochne ka kaam engineer ke paas rehta hai.</p></div>

<div class="iv"><p class="q">"Shebang kya hai aur chmod +x kyun chahiye?"</p><p>Shebang, <code>#!/bin/bash</code>, script ki pehli line hai aur kernel ko batati hai ki file kaunsa interpreter execute kare. <code>chmod +x</code> execute permission set karta hai taaki file seedha <code>./script.sh</code> se launch ho sake. Batao ki current directory <code>PATH</code> mein nahi hoti isliye <code>./</code> lagta hai, aur <code>bash script.sh</code> execute bit ke bina bhi chalta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Script commands ki text file hai jise Bash order mein chalata hai.</li>
<li>Pehli line <code>#!/bin/bash</code> interpreter batati hai; <code>#</code> se shuru lines comments hain.</li>
<li><code>chmod +x</code> use executable banata hai; <code>./name.sh</code> se chalao.</li>
<li><i>Permission denied</i> matlab execute bit nahi hai; <i>command not found</i> matlab shell ko file PATH par nahi mili.</li>
<li>Scripts daily checks ko tez, repeatable aur har baar same banati hain.</li>
</ul></div>
`}};export{e as default};