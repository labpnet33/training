var e={id:`argparse`,h:{en:`argparse: give your script proper options`,hi:`argparse: apni script ko sahi options do`},body:{en:`
<p><b>The idea of this chapter:</b> instead of editing the script every time a file name changes, let the user type it: <code>-d devices.csv</code>. The standard module <code>argparse</code> reads what you typed, checks it, builds the <code>--help</code> page for free and complains politely when something is wrong.</p>

<h3>Analogy: a restaurant order form</h3>
<p>A form with tick boxes ("extra cheese: yes/no") and blanks ("table number: ___") is easier for the kitchen than a free-text note. Your script's options are the form. Switches are tick boxes; options with values are the blanks.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Command line parsed into an args object">
<rect x="10" y="30" width="230" height="60" rx="10" fill="#bae6fd"/><text x="125" y="56" text-anchor="middle" class="svg-ink" font-size="12">netbackup.py -d lab.csv -n</text><text x="125" y="76" text-anchor="middle" class="svg-muted" font-size="10">what you type</text>
<rect x="270" y="30" width="120" height="60" rx="10" fill="#fde68a"/><text x="330" y="56" text-anchor="middle" class="svg-ink" font-size="12">argparse</text><text x="330" y="76" text-anchor="middle" class="svg-muted" font-size="10">reads and checks</text>
<rect x="420" y="20" width="210" height="80" rx="10" fill="#bbf7d0"/><text x="525" y="44" text-anchor="middle" class="svg-ink" font-size="11">args.devices = "lab.csv"</text><text x="525" y="64" text-anchor="middle" class="svg-ink" font-size="11">args.dry_run = True</text><text x="525" y="84" text-anchor="middle" class="svg-ink" font-size="11">args.verbose = False</text>
<line x1="240" y1="60" x2="270" y2="60" stroke="#64748b" stroke-width="2"/><line x1="390" y1="60" x2="420" y2="60" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The typed words become named values.</p></div>

<h3>The parser from the lab tool, line by line</h3>
<pre class="code">import argparse

parser = argparse.ArgumentParser(description="Back up router configs over SSH.")
parser.add_argument("-d", "--devices", default="devices.csv", help="CSV file with name,ip columns (default: devices.csv)")
parser.add_argument("-o", "--outdir", default="backups", help="folder for the backups (default: backups)")
parser.add_argument("-n", "--dry-run", action="store_true", help="only show what would be backed up")
parser.add_argument("-v", "--verbose", action="store_true", help="also log every successful backup")
args = parser.parse_args()</pre>
<ul>
<li><code>ArgumentParser(description=...)</code> creates the parser; the description appears on the help page.</li>
<li><code>add_argument("-d", "--devices", ...)</code> declares an option with a short name and a long name. <code>default</code> is used when the user gives nothing. <code>help</code> is the sentence shown in <code>--help</code>.</li>
<li><code>action="store_true"</code> makes a switch: absent means <code>False</code>, present means <code>True</code>. It takes no value.</li>
<li><code>parse_args()</code> reads the real command line and returns an object, here called <code>args</code>.</li>
<li>Later the script reads <code>args.devices</code>, <code>args.outdir</code>, <code>args.dry_run</code> and <code>args.verbose</code>. A dash in the long name becomes an underscore: <code>--dry-run</code> is <code>args.dry_run</code>.</li>
</ul>

<h3>Using the options</h3>
<p>With no options, the defaults apply, as the earlier dry run showed. An option that takes a value:</p>
<pre class="out">AUTO01$ python3 netbackup.py -d nothere.csv
Traceback (most recent call last):
  File "netbackup.py", line 30, in &lt;module&gt;
    with open(args.devices) as f:
<span class="hl">FileNotFoundError: [Errno 2] No such file or directory: 'nothere.csv'</span></pre>
<p>The value you typed travelled into <code>args.devices</code> and the script tried to open that file. Line 30 is <code>with open(args.devices) as f:</code>. The error is honest and clear, but a beginner sees a long traceback; a friendlier tool would check the file first and print one sentence (chapter 8 shows how to handle errors). An unknown option is caught by <code>argparse</code> itself:</p>
<pre class="out">AUTO01$ python3 netbackup.py --bogus; echo "rc=$?"
usage: netbackup.py [-h] [-d DEVICES] [-o OUTDIR] [-n] [-v]
netbackup.py: error: unrecognized arguments: --bogus
<span class="hl">rc=2</span></pre>
<p>You wrote no error handling for this; <code>argparse</code> prints the usage line, names the bad argument and exits with code 2.</p>

<div class="eg"><p><b>Worked example.</b> You want a <code>--site</code> option so the same tool backs up only one site. You would add one line: <code>parser.add_argument("-s", "--site", help="only devices whose name starts with this text")</code>, and later use <code>args.site</code>. Nothing else changes, and <code>--help</code> documents it automatically.</p></div>

<div class="note"><p><b>Reference code (not run in the simulator).</b> The <code>required=True</code> setting makes an option mandatory, and <code>type=int</code> converts a value to a number, for example <code>parser.add_argument("--timeout", type=int, default=10)</code>. A <code>choices=[...]</code> list restricts the value to a fixed set. These are standard <code>argparse</code> features; the lab tool does not use them.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Reading <code>sys.argv</code> by hand and re-inventing the parsing. Forgetting that <code>--dry-run</code> becomes <code>args.dry_run</code>. Writing a <code>help</code> text that says nothing. Choosing a destructive default; the safe default should do the less harmful thing.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>store_true</code> options hold <code>True</code> only when the user types them. An option with a default still works without being typed; a switch defaults to <code>False</code>.</p></div>

<div class="scn"><h4>Hard-coded file name</h4><p>A script opened <code>devices.csv</code> from its own folder. When the team wanted to run it for the lab inventory they copied the script and edited it, and soon there were five slightly different copies. Adding <code>-d</code> replaced all five with one.</p><p><b>Lesson:</b> options beat copies.</p></div>

<div class="iv"><p class="q">"Why use argparse instead of sys.argv?"</p><p>It parses options in any order, supports short and long names and defaults, validates input, generates <code>--help</code> and gives a standard error and exit code 2 for bad usage. With <code>sys.argv</code> I would write all of that myself.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>add_argument</code> declares an option; <code>parse_args()</code> reads the command line.</li>
<li><code>default</code> applies when nothing is typed; <code>store_true</code> makes an on/off switch.</li>
<li>Dashes in long names become underscores in <code>args</code>.</li>
<li>Bad usage prints the usage line and exits with code 2.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> file ka naam badalne par har baar script edit karne ki jagah user ko type karne do: <code>-d devices.csv</code>. Standard module <code>argparse</code> jo aapne type kiya woh padhta hai, check karta hai, <code>--help</code> page free mein banata hai aur kuch galat ho to tameez se shikayat karta hai.</p>

<h3>Analogy: restaurant ka order form</h3>
<p>Tick boxes ("extra cheese: haan/nahi") aur khaali jagah ("table number: ___") wala form kitchen ke liye free-text note se aasaan hai. Aapki script ke options wahi form hain. Switches tick boxes hain; value wale options khaali jagah hain.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Command line args object mein badli">
<rect x="10" y="30" width="230" height="60" rx="10" fill="#bae6fd"/><text x="125" y="56" text-anchor="middle" class="svg-ink" font-size="12">netbackup.py -d lab.csv -n</text><text x="125" y="76" text-anchor="middle" class="svg-muted" font-size="10">jo aap type karte ho</text>
<rect x="270" y="30" width="120" height="60" rx="10" fill="#fde68a"/><text x="330" y="56" text-anchor="middle" class="svg-ink" font-size="12">argparse</text><text x="330" y="76" text-anchor="middle" class="svg-muted" font-size="10">padhta, check karta</text>
<rect x="420" y="20" width="210" height="80" rx="10" fill="#bbf7d0"/><text x="525" y="44" text-anchor="middle" class="svg-ink" font-size="11">args.devices = "lab.csv"</text><text x="525" y="64" text-anchor="middle" class="svg-ink" font-size="11">args.dry_run = True</text><text x="525" y="84" text-anchor="middle" class="svg-ink" font-size="11">args.verbose = False</text>
<line x1="240" y1="60" x2="270" y2="60" stroke="#64748b" stroke-width="2"/><line x1="390" y1="60" x2="420" y2="60" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Type kiye shabd naam wali values ban jaate hain.</p></div>

<h3>Lab tool ka parser, line by line</h3>
<pre class="code">import argparse

parser = argparse.ArgumentParser(description="Back up router configs over SSH.")
parser.add_argument("-d", "--devices", default="devices.csv", help="CSV file with name,ip columns (default: devices.csv)")
parser.add_argument("-o", "--outdir", default="backups", help="folder for the backups (default: backups)")
parser.add_argument("-n", "--dry-run", action="store_true", help="only show what would be backed up")
parser.add_argument("-v", "--verbose", action="store_true", help="also log every successful backup")
args = parser.parse_args()</pre>
<ul>
<li><code>ArgumentParser(description=...)</code> parser banata hai; description help page par dikhta hai.</li>
<li><code>add_argument("-d", "--devices", ...)</code> chhote naam aur lambe naam ke saath option declare karta hai. <code>default</code> tab use hota hai jab user kuch na de. <code>help</code> woh vakya hai jo <code>--help</code> mein dikhta hai.</li>
<li><code>action="store_true"</code> switch banata hai: na likho to <code>False</code>, likho to <code>True</code>. Isme value nahi hoti.</li>
<li><code>parse_args()</code> asli command line padhta hai aur ek object return karta hai, yahan <code>args</code>.</li>
<li>Baad mein script <code>args.devices</code>, <code>args.outdir</code>, <code>args.dry_run</code> aur <code>args.verbose</code> padhti hai. Lambe naam ka dash underscore ban jaata hai: <code>--dry-run</code> matlab <code>args.dry_run</code>.</li>
</ul>

<h3>Options use karna</h3>
<p>Bina options ke defaults lagte hain, jaisa pehle dry run ne dikhaya. Value lene wala option:</p>
<pre class="out">AUTO01$ python3 netbackup.py -d nothere.csv
Traceback (most recent call last):
  File "netbackup.py", line 30, in &lt;module&gt;
    with open(args.devices) as f:
<span class="hl">FileNotFoundError: [Errno 2] No such file or directory: 'nothere.csv'</span></pre>
<p>Aapki type ki value <code>args.devices</code> mein gayi aur script ne woh file kholne ki koshish ki. Line 30 <code>with open(args.devices) as f:</code> hai. Error imaandar aur saaf hai, par beginner ko lamba traceback dikhta hai; dost jaisa tool pehle file check karke ek vakya print karta (error handling chapter 8 mein hai). Anjaan option <code>argparse</code> khud pakadta hai:</p>
<pre class="out">AUTO01$ python3 netbackup.py --bogus; echo "rc=$?"
usage: netbackup.py [-h] [-d DEVICES] [-o OUTDIR] [-n] [-v]
netbackup.py: error: unrecognized arguments: --bogus
<span class="hl">rc=2</span></pre>
<p>Iske liye aapne koi error handling nahi likhi; <code>argparse</code> usage line print karta hai, galat argument ka naam batata hai aur code 2 se exit karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Aapko <code>--site</code> option chahiye taaki wahi tool sirf ek site ka backup le. Aap ek line jodoge: <code>parser.add_argument("-s", "--site", help="only devices whose name starts with this text")</code>, aur baad mein <code>args.site</code> use karoge. Aur kuch nahi badalta, aur <code>--help</code> use khud document kar deta hai.</p></div>

<div class="note"><p><b>Reference code (not run in the simulator).</b> <code>required=True</code> option ko zaroori banata hai, aur <code>type=int</code> value ko number mein badalta hai, jaise <code>parser.add_argument("--timeout", type=int, default=10)</code>. <code>choices=[...]</code> list value ko fixed set tak rokti hai. Yeh standard <code>argparse</code> features hain; lab tool inhe use nahi karta.</p></div>

<div class="warn"><p><b>Common mistakes.</b> <code>sys.argv</code> haath se padhna aur parsing khud dobara banana. Yeh bhoolna ki <code>--dry-run</code> <code>args.dry_run</code> ban jaata hai. Aisa <code>help</code> text likhna jo kuch na kahe. Nuksaan karne wala default chunna; safe default kam nuksaan wala kaam kare.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>store_true</code> options tabhi <code>True</code> rakhte hain jab user unhe type kare. Default wala option bina type kiye bhi chalta hai; switch ka default <code>False</code> hai.</p></div>

<div class="scn"><h4>Hard-coded file name</h4><p>Ek script apne folder se <code>devices.csv</code> kholti thi. Team ko lab inventory ke liye chalani thi to unhone script copy karke edit ki, aur jaldi paanch thodi-thodi alag copies ho gayin. <code>-d</code> jodne ne paanchon ko ek se badal diya.</p><p><b>Lesson:</b> options copies se behtar hain.</p></div>

<div class="iv"><p class="q">"sys.argv ki jagah argparse kyon?"</p><p>Woh options ko kisi bhi order mein parse karta hai, chhote aur lambe naam aur defaults support karta hai, input validate karta hai, <code>--help</code> banata hai aur galat usage par standard error aur exit code 2 deta hai. <code>sys.argv</code> mein yeh sab mujhe khud likhna padta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>add_argument</code> option declare karta hai; <code>parse_args()</code> command line padhta hai.</li>
<li>Kuch type na ho to <code>default</code> lagta hai; <code>store_true</code> on/off switch banata hai.</li>
<li>Lambe naam ke dash <code>args</code> mein underscore ban jaate hain.</li>
<li>Galat usage usage line print karta hai aur code 2 se exit karta hai.</li>
</ul></div>
`}};export{e as default};