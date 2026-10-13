var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p><b>The idea of this chapter:</b> one page to revise the whole module. You started with a script that only worked when you ran it by hand. You now know how to turn it into a tool: its own environment, options, a log, error handling, a meaningful exit code and a schedule.</p>

<h3>Analogy: from a recipe to a restaurant kitchen</h3>
<p>Cooking a dish once is a script. A kitchen that produces the same dish every night, tells you when an ingredient runs out and keeps records is a tool. Everything in this module was a step from the first to the second.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="From a script to a scheduled tool">
<rect x="10" y="30" width="95" height="60" rx="10" fill="#e2e8f0"/><text x="57" y="56" text-anchor="middle" class="svg-ink" font-size="12">Script</text><text x="57" y="74" text-anchor="middle" class="svg-muted" font-size="10">works by hand</text>
<rect x="125" y="30" width="95" height="60" rx="10" fill="#bae6fd"/><text x="172" y="56" text-anchor="middle" class="svg-ink" font-size="12">Environment</text><text x="172" y="74" text-anchor="middle" class="svg-muted" font-size="10">venv, pip</text>
<rect x="240" y="30" width="95" height="60" rx="10" fill="#fde68a"/><text x="287" y="56" text-anchor="middle" class="svg-ink" font-size="12">Options</text><text x="287" y="74" text-anchor="middle" class="svg-muted" font-size="10">argparse</text>
<rect x="355" y="30" width="95" height="60" rx="10" fill="#ddd6fe"/><text x="402" y="56" text-anchor="middle" class="svg-ink" font-size="12">Diary</text><text x="402" y="74" text-anchor="middle" class="svg-muted" font-size="10">logging</text>
<rect x="470" y="30" width="75" height="60" rx="10" fill="#fecaca"/><text x="507" y="56" text-anchor="middle" class="svg-ink" font-size="12">Errors</text><text x="507" y="74" text-anchor="middle" class="svg-muted" font-size="10">try, exit</text>
<rect x="560" y="30" width="70" height="60" rx="10" fill="#bbf7d0"/><text x="595" y="56" text-anchor="middle" class="svg-ink" font-size="12">cron</text><text x="595" y="74" text-anchor="middle" class="svg-muted" font-size="10">nightly</text>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="12">each box is one chapter of this module</text>
</svg><p class="cap">The journey from script to tool.</p></div>

<h3>Chapter recap</h3>
<ul>
<li><b>1 Setup.</b> <code>python3 --version</code>, <code>which python3</code>, <code>pip list</code>; the standard library needs no install.</li>
<li><b>2 Environments and layout.</b> One virtual environment per project; <code>requirements.txt</code>; separate code, data, output and logs.</li>
<li><b>3 Running safely.</b> <code>sys.argv</code>, <code>__name__</code>, dry runs and exit codes.</li>
<li><b>4 Reading docs.</b> <code>--help</code>, <code>type</code>, <code>dir</code>, and error messages as documentation.</li>
<li><b>5 argparse.</b> <code>add_argument</code>, <code>store_true</code>, defaults, exit code 2 on bad usage.</li>
<li><b>6 logging.</b> Levels, <code>basicConfig</code>, a log file and a <code>-v</code> switch.</li>
<li><b>7 cron.</b> Five time fields, absolute paths and <code>&gt;&gt; log 2&gt;&amp;1</code>.</li>
<li><b>8 Troubleshooting.</b> Read the last line, print values, <code>try</code> and <code>except</code>, exit code 1 for failures.</li>
</ul>

<h3>Command and syntax cheat sheet</h3>
<pre class="code">python3 --version               which Python and version
which python3                   where it lives
pip list                        installed packages
python3 script.py --help        show options
python3 script.py --dry-run     show, do not change
python3 script.py; echo $?      run and print the exit code
crontab -l                      list the schedule
grep CRON /var/log/syslog       did cron start it?
30 1 * * * /full/path/tool.py &gt;&gt; /full/path/log 2&gt;&amp;1</pre>
<p>The first six lines are typed in the terminal. The last line is a crontab entry, not a terminal command: minute, hour, day, month, weekday, command, output appended to a log.</p>

<h3>Exam checklist</h3>
<ul>
<li>I can check the Python version, the path and the installed packages.</li>
<li>I can explain why each project needs its own virtual environment.</li>
<li>I know item 0 of <code>sys.argv</code> is the script name.</li>
<li>I always try <code>--help</code> and a dry run first.</li>
<li>I can write the five cron fields from memory and I use absolute paths.</li>
<li>I know log levels from DEBUG to CRITICAL and that WARNING is the default.</li>
<li>I can name KeyError, IndexError, FileNotFoundError and ModuleNotFoundError and their meanings.</li>
<li>I make scripts exit with 0 for success and non-zero for failure.</li>
</ul>

<div class="eg"><p><b>Worked example for revision.</b> A nightly backup shows nothing in the morning. Check: did cron start it (<code>grep CRON /var/log/syslog</code>); where did the output go (the appended log); what does the error say (last line first); are paths absolute; what exit code did it return.</p></div>

<div class="warn"><p><b>Common mistakes to avoid on exam day.</b> Mixing up the cron field order. Saying <code>pip</code> installs the standard library. Forgetting <code>2&gt;&amp;1</code>. Believing "no error shown" means success under cron. Ignoring the exit code.</p></div>
<div class="exam"><p><b>Exam trap.</b> Under cron, the working directory and PATH are minimal. A script that works by hand but fails from cron nearly always has a relative path or a missing environment.</p></div>

<div class="scn"><h4>Handing over a tool to the night team</h4><p>A senior engineer prepares the backup tool for the night shift. It has its own environment and requirements file, <code>--help</code> and <code>--dry-run</code>, a log file, handling for unreachable routers, a non-zero exit code on failure and a cron entry with full paths. The night team never needs to call her.</p><p><b>Lesson:</b> a tool is a script plus everything that makes it safe to run unattended.</p></div>

<div class="iv"><p class="q">"How would you turn a one-off Python script into a production tool?"</p><p>I isolate it in a virtual environment with a requirements file, add argparse options including a dry run, add logging to a file, handle expected errors per device, return a proper exit code, keep secrets out of the code and schedule it with cron using absolute paths and captured output. Then I verify with the log and the exit code.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A tool needs: an environment, options, a log, error handling, an exit code and a schedule.</li>
<li>Always ask the tool for help and run a dry run first.</li>
<li>Cron needs absolute paths and captured output.</li>
<li>Read errors from the last line; fix one thing at a time.</li>
<li>Keep passwords out of code; read them from the environment or a vault.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> poore module ko revise karne ke liye ek page. Aapne aisi script se shuru kiya tha jo sirf haath se chalane par chalti thi. Ab aap jaante ho use tool kaise banate hain: apna environment, options, log, error handling, matlab wala exit code aur schedule.</p>

<h3>Analogy: recipe se restaurant kitchen tak</h3>
<p>Ek dish ek baar banana script hai. Jo kitchen har raat wahi dish banaye, ingredient khatam hone par bataye aur record rakhe woh tool hai. Is module ka har hissa pehle se doosre tak ka ek kadam tha.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Script se scheduled tool tak">
<rect x="10" y="30" width="95" height="60" rx="10" fill="#e2e8f0"/><text x="57" y="56" text-anchor="middle" class="svg-ink" font-size="12">Script</text><text x="57" y="74" text-anchor="middle" class="svg-muted" font-size="10">haath se chalti</text>
<rect x="125" y="30" width="95" height="60" rx="10" fill="#bae6fd"/><text x="172" y="56" text-anchor="middle" class="svg-ink" font-size="12">Environment</text><text x="172" y="74" text-anchor="middle" class="svg-muted" font-size="10">venv, pip</text>
<rect x="240" y="30" width="95" height="60" rx="10" fill="#fde68a"/><text x="287" y="56" text-anchor="middle" class="svg-ink" font-size="12">Options</text><text x="287" y="74" text-anchor="middle" class="svg-muted" font-size="10">argparse</text>
<rect x="355" y="30" width="95" height="60" rx="10" fill="#ddd6fe"/><text x="402" y="56" text-anchor="middle" class="svg-ink" font-size="12">Diary</text><text x="402" y="74" text-anchor="middle" class="svg-muted" font-size="10">logging</text>
<rect x="470" y="30" width="75" height="60" rx="10" fill="#fecaca"/><text x="507" y="56" text-anchor="middle" class="svg-ink" font-size="12">Errors</text><text x="507" y="74" text-anchor="middle" class="svg-muted" font-size="10">try, exit</text>
<rect x="560" y="30" width="70" height="60" rx="10" fill="#bbf7d0"/><text x="595" y="56" text-anchor="middle" class="svg-ink" font-size="12">cron</text><text x="595" y="74" text-anchor="middle" class="svg-muted" font-size="10">nightly</text>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="12">har box is module ka ek chapter hai</text>
</svg><p class="cap">Script se tool tak ka safar.</p></div>

<h3>Chapter recap</h3>
<ul>
<li><b>1 Setup.</b> <code>python3 --version</code>, <code>which python3</code>, <code>pip list</code>; standard library ko install nahi karna padta.</li>
<li><b>2 Environments aur layout.</b> Har project ka ek virtual environment; <code>requirements.txt</code>; code, data, output aur logs alag.</li>
<li><b>3 Running safely.</b> <code>sys.argv</code>, <code>__name__</code>, dry runs aur exit codes.</li>
<li><b>4 Reading docs.</b> <code>--help</code>, <code>type</code>, <code>dir</code>, aur error messages documentation ki tarah.</li>
<li><b>5 argparse.</b> <code>add_argument</code>, <code>store_true</code>, defaults, galat usage par exit code 2.</li>
<li><b>6 logging.</b> Levels, <code>basicConfig</code>, log file aur <code>-v</code> switch.</li>
<li><b>7 cron.</b> Paanch time fields, absolute paths aur <code>&gt;&gt; log 2&gt;&amp;1</code>.</li>
<li><b>8 Troubleshooting.</b> Aakhri line padho, values print karo, <code>try</code> aur <code>except</code>, failures ke liye exit code 1.</li>
</ul>

<h3>Command aur syntax cheat sheet</h3>
<pre class="code">python3 --version               which Python and version
which python3                   where it lives
pip list                        installed packages
python3 script.py --help        show options
python3 script.py --dry-run     show, do not change
python3 script.py; echo $?      run and print the exit code
crontab -l                      list the schedule
grep CRON /var/log/syslog       did cron start it?
30 1 * * * /full/path/tool.py &gt;&gt; /full/path/log 2&gt;&amp;1</pre>
<p>Pehli chhe lines terminal mein type hoti hain. Aakhri line crontab entry hai, terminal command nahi: minute, hour, day, month, weekday, command, output log mein append.</p>

<h3>Exam checklist</h3>
<ul>
<li>Main Python version, path aur installed packages check kar sakta hoon.</li>
<li>Main samjha sakta hoon ki har project ko apna virtual environment kyon chahiye.</li>
<li>Mujhe pata hai <code>sys.argv</code> ka item 0 script ka naam hai.</li>
<li>Main hamesha pehle <code>--help</code> aur dry run try karta hoon.</li>
<li>Main paanch cron fields yaad se likh sakta hoon aur absolute paths use karta hoon.</li>
<li>Mujhe DEBUG se CRITICAL tak log levels pata hain aur yeh ki default WARNING hai.</li>
<li>Main KeyError, IndexError, FileNotFoundError aur ModuleNotFoundError aur unke matlab bata sakta hoon.</li>
<li>Main scripts ko safalta par 0 aur failure par non-zero se exit karwata hoon.</li>
</ul>

<div class="eg"><p><b>Revision ke liye worked example.</b> Nightly backup subah kuch nahi dikhata. Check karo: kya cron ne use shuru kiya (<code>grep CRON /var/log/syslog</code>); output kahan gaya (append kiya hua log); error kya kehta hai (aakhri line pehle); kya paths absolute hain; kaunsa exit code mila.</p></div>

<div class="warn"><p><b>Exam ke din bachne wali galtiyan.</b> Cron fields ka order mix karna. Kehna ki <code>pip</code> standard library install karta hai. <code>2&gt;&amp;1</code> bhool jana. Maan lena ki cron mein "error nahi dikha" ka matlab safalta hai. Exit code ko ignore karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> cron mein working directory aur PATH minimal hote hain. Jo script haath se chalti hai par cron se fail hoti hai, usme lagbhag hamesha relative path ya missing environment hota hai.</p></div>

<div class="scn"><h4>Night team ko tool saunpna</h4><p>Ek senior engineer night shift ke liye backup tool taiyar karti hai. Usme apna environment aur requirements file, <code>--help</code> aur <code>--dry-run</code>, log file, unreachable routers ka handling, failure par non-zero exit code aur full paths wali cron entry hai. Night team ko use kabhi phone nahi karna padta.</p><p><b>Lesson:</b> tool woh script hai jisme bina nigrani chalne ko safe banane wali sab cheezein hain.</p></div>

<div class="iv"><p class="q">"Ek baar ki Python script ko production tool kaise banaoge?"</p><p>Use requirements file ke saath virtual environment mein isolate karta hoon, dry run samet argparse options jodta hoon, file mein logging jodta hoon, har device ke expected errors handle karta hoon, sahi exit code deta hoon, secrets code se bahar rakhta hoon aur use cron se absolute paths aur captured output ke saath schedule karta hoon. Phir log aur exit code se verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tool ko chahiye: environment, options, log, error handling, exit code aur schedule.</li>
<li>Hamesha tool se help maango aur pehle dry run karo.</li>
<li>cron ko absolute paths aur captured output chahiye.</li>
<li>Errors aakhri line se padho; ek-ek cheez fix karo.</li>
<li>Passwords code se bahar rakho; environment ya vault se padho.</li>
</ul></div>
`}};export{e as default};