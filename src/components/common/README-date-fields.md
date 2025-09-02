# Date Field Types in ConfigurableForm

The ConfigurableForm now supports three different types of date fields:

## 1. DateTimePicker (Full Date + Time)
For fields that need both date and time selection (e.g., event start time).

```typescript
<ConfigurableForm
    // ... other props
    dateTimeList={["time", "startTime", "endTime"]}
/>
```

## 2. DatePicker (Date Only)
For fields that need date selection without time (e.g., start date, end date).

```typescript
<ConfigurableForm
    // ... other props
    dateOnlyList={["startDate", "endDate", "eventDate"]}
/>
```

## 3. Weekday Fields (Days of Week)
For fields that need weekday selection (e.g., weekly social days). These are automatically detected as selector fields.

```typescript
<ConfigurableForm
    // ... other props
    optionsMap={{
        weeklyDays: weekdayOptions,  // Import from @/utils/weekday-options
        recurringDays: weekdayOptions
    }}
/>
```

## Example: Social Event Form

```typescript
import { weekdayOptions } from '@/utils/weekday-options';

<ConfigurableForm
    formSchema={socialEventSchema}
    endpoint="/events"
    entityName="event"
    displayNames={displayNames}
    defaultValues={defaultValues}
    // Date field configuration
    dateTimeList={["time"]}           // Event time (full date + time)
    dateOnlyList={["startDate", "endDate"]}  // Start/end dates (no time)
    // Weekday fields are automatically detected as selectors
    optionsMap={{
        weeklyDays: weekdayOptions
    }}
/>
```

## Field Priority Order

The form checks field types in this order:
1. **DateTimePicker** - `dateTimeList` 
2. **DatePicker** - `dateOnlyList`
3. **Fallback** - `dateList` (uses DatePicker by default)
4. **Weekday fields** - Automatically detected as selector fields (not multi-selectors)

## Zod Schema Example

```typescript
export const socialEventSchema = z.object({
    title: z.string(),
    time: z.date(),                    // Will use DateTimePicker
    startDate: z.date(),               // Will use DatePicker
    endDate: z.date(),                 // Will use DatePicker
    weeklyDays: z.array(z.enum([      // Will use WeekdaySelector
        "monday", "tuesday", "wednesday", 
        "thursday", "friday", "saturday", "sunday"
    ])),
});
```

## Benefits

✅ **Flexible**: Choose the right date input for each field
✅ **User-friendly**: Different UX for different date needs
✅ **Consistent**: All date fields follow the same pattern
✅ **Type-safe**: Full TypeScript support
✅ **Reusable**: Same pattern works across all forms
