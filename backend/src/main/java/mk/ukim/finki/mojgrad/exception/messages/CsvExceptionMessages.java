package mk.ukim.finki.mojgrad.exception.messages;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class CsvExceptionMessages {

    public static final String EMPTY_FILE = "Прикачената датотека е празна.";
    public static final String INVALID_FILE_TYPE = "Дозволени се само .csv датотеки. Прикачена: %s.";
    public static final String INVALID_FORMAT = "Датотеката не може да се парсира. Проверете дали е валидна UTF-8 CSV датотека.";
    public static final String MISSING_HEADERS = "CSV мора да ги содржи хедерите: title, description, latitude, longitude, priority, status, department.";
    public static final String EMPTY_CSV = "CSV датотеката нема ниту еден податочен ред.";
    public static final String MALFORMED_ROW = "Ред %d: има помалку колони од очекувано. Проверете за непишани запирки.";


    public static final String MISSING_FIELD = "Ред %d: полето '%s' е задолжително.";
    public static final String FIELD_TOO_LONG = "Ред %d: полето '%s' ја надминува дозволената должина од %d карактери.";

    public static final String INVALID_NUMBER = "Ред %d: полето '%s' мора да биде валиден број, добиено '%s'.";
    public static final String OUT_OF_RANGE = "Ред %d: полето '%s' со вредност '%s' е надвор од дозволениот опсег (%s).";


    public static final String INVALID_ENUM = "Ред %d: невалидна вредност за %s '%s'. Дозволени: %s.";
    public static final String DEPARTMENT_MISMATCH = "Ред %d: одделот '%s' не одговара на вашиот оддел '%s'.";


    public static final String INVALID_SORT_FIELD = "Невалидно поле за подредување '%s'. Дозволени: createdAt, priority, complaintStatus, title.";
    public static final String INVALID_SORT_DIRECTION = "Невалидна насока за подредување '%s'. Дозволени: asc, desc.";
    public static final String EXPORT_WRITE_ERROR = "Настана грешка при експортирање на CSV. Обидете се повторно.";
}